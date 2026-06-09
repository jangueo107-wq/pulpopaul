import { prisma } from "@/lib/db";
import { endOfDay, startOfDay } from "@/lib/dates";
import { parseDateInput } from "@/lib/utils";
import { esVentaActiva, ventaActiva } from "@/lib/venta-filters";

export type VentaDetalle = {
  id: string;
  ventaId: string;
  fecha: string;
  hora: string;
  fechaParam: string;
  producto: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  costoUnitario: number;
  estado: string;
  motivoAnulacion: string | null;
  fechaAnulacion: string | null;
  horaAnulacion: string | null;
};

function formatAnulacion(fecha: Date | null) {
  if (!fecha) return { fecha: null, hora: null };
  const day = String(fecha.getDate()).padStart(2, "0");
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const year = fecha.getFullYear();
  const hours = String(fecha.getHours()).padStart(2, "0");
  const minutes = String(fecha.getMinutes()).padStart(2, "0");
  return {
    fecha: `${day}/${month}/${year}`,
    hora: `${hours}:${minutes}`,
  };
}

function mapItem(item: {
  id: string;
  ventaId: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  venta: {
    fecha: Date;
    estado: string;
    motivoAnulacion: string | null;
    fechaAnulacion: Date | null;
  };
  producto: { id: string; nombre: string };
}): VentaDetalle {
  const fecha = item.venta.fecha;
  const day = String(fecha.getDate()).padStart(2, "0");
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const year = fecha.getFullYear();
  const hours = String(fecha.getHours()).padStart(2, "0");
  const minutes = String(fecha.getMinutes()).padStart(2, "0");
  const anul = formatAnulacion(item.venta.fechaAnulacion);

  return {
    id: item.id,
    ventaId: item.ventaId,
    fecha: `${day}/${month}/${year}`,
    hora: `${hours}:${minutes}`,
    fechaParam: fecha.toISOString().slice(0, 10),
    producto: item.producto.nombre,
    productoId: item.producto.id,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    precioTotal: item.precioUnitario * item.cantidad,
    costoUnitario: item.costoUnitario,
    estado: item.venta.estado,
    motivoAnulacion: item.venta.motivoAnulacion,
    fechaAnulacion: anul.fecha,
    horaAnulacion: anul.hora,
  };
}

function buildDateFilter(fecha?: string | null, desde?: string | null, hasta?: string | null) {
  if (fecha) {
    const d = parseDateInput(fecha);
    return { gte: startOfDay(d), lte: endOfDay(d) };
  }
  if (desde || hasta) {
    const filter: { gte?: Date; lte?: Date } = {};
    if (desde) filter.gte = startOfDay(parseDateInput(desde));
    if (hasta) filter.lte = endOfDay(parseDateInput(hasta));
    return filter;
  }
  return undefined;
}

export async function fetchVentasDetalle(params: {
  fecha?: string | null;
  desde?: string | null;
  hasta?: string | null;
  limit?: number;
}) {
  const dateFilter = buildDateFilter(params.fecha, params.desde, params.hasta);

  const items = await prisma.ventaItem.findMany({
    where: dateFilter ? { venta: { fecha: dateFilter } } : undefined,
    include: {
      venta: true,
      producto: { select: { id: true, nombre: true } },
    },
    orderBy: { venta: { fecha: "desc" } },
    take: params.limit,
  });

  return items.map(mapItem);
}

export async function fetchResumenDia(fecha: Date) {
  const desde = startOfDay(fecha);
  const hasta = endOfDay(fecha);

  const items = await prisma.ventaItem.findMany({
    where: { venta: { fecha: { gte: desde, lte: hasta }, ...ventaActiva } },
  });

  const ventasTotales = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const costos = items.reduce((s, i) => s + i.costoUnitario * i.cantidad, 0);
  const ventaIds = new Set(items.map((i) => i.ventaId));

  return {
    ventasTotales,
    gananciaBruta: ventasTotales - costos,
    numVentas: ventaIds.size,
    numItems: items.length,
  };
}

export function buildResumenPorDia(ventas: VentaDetalle[]) {
  const resumen: Record<
    string,
    { fecha: string; ventasTotales: number; gananciaBruta: number; numVentas: number }
  > = {};

  const activas = ventas.filter((v) => esVentaActiva(v.estado));
  const grouped = new Map<string, VentaDetalle[]>();
  for (const v of activas) {
    const list = grouped.get(v.fechaParam) ?? [];
    list.push(v);
    grouped.set(v.fechaParam, list);
  }

  for (const [fechaParam, list] of grouped) {
    const ventasTotales = list.reduce((s, i) => s + i.precioTotal, 0);
    const costos = list.reduce((s, i) => s + i.costoUnitario * i.cantidad, 0);
    const ventaIds = new Set(list.map((i) => i.ventaId));
    resumen[fechaParam] = {
      fecha: list[0].fecha,
      ventasTotales,
      gananciaBruta: ventasTotales - costos,
      numVentas: ventaIds.size,
    };
  }

  return resumen;
}

export async function anularVenta(ventaId: string, motivo: string) {
  return prisma.$transaction(async (tx) => {
    const venta = await tx.venta.findUnique({
      where: { id: ventaId },
      include: { items: true },
    });

    if (!venta) throw new Error("Venta no encontrada");
    if (venta.estado === "ANULADA") throw new Error("Esta venta ya está anulada");

    for (const item of venta.items) {
      await tx.producto.update({
        where: { id: item.productoId },
        data: { cantidad: { increment: item.cantidad } },
      });
    }

    return tx.venta.update({
      where: { id: ventaId },
      data: {
        estado: "ANULADA",
        fechaAnulacion: new Date(),
        motivoAnulacion: motivo.trim() || "Vendido por error",
      },
      include: {
        items: { include: { producto: true } },
      },
    });
  });
}
