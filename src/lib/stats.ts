import { prisma } from "@/lib/db";
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from "@/lib/dates";
import { ventaActiva } from "@/lib/venta-filters";

export type PeriodStats = {
  ventasTotales: number;
  gananciaBruta: number;
  gastos: number;
  perdidas: number;
  resultado: number;
  numVentas: number;
};

async function ventasEnRango(desde: Date, hasta: Date) {
  const items = await prisma.ventaItem.findMany({
    where: {
      venta: { fecha: { gte: desde, lte: hasta }, ...ventaActiva },
    },
  });

  const ventasTotales = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const costos = items.reduce((s, i) => s + i.costoUnitario * i.cantidad, 0);
  const ventaIds = new Set(items.map((i) => i.ventaId));

  return { ventasTotales, gananciaBruta: ventasTotales - costos, numVentas: ventaIds.size };
}

async function gastosEnRango(desde: Date, hasta: Date) {
  const agg = await prisma.gasto.aggregate({
    _sum: { monto: true },
    where: { fecha: { gte: desde, lte: hasta } },
  });
  return agg._sum.monto ?? 0;
}

async function perdidasEnRango(desde: Date, hasta: Date) {
  const perdidas = await prisma.perdida.findMany({
    where: { fecha: { gte: desde, lte: hasta } },
  });
  return perdidas.reduce((s, p) => s + p.costoUnitario * p.cantidad, 0);
}

export async function calcularPeriodo(desde: Date, hasta: Date): Promise<PeriodStats> {
  const [ventas, gastos, perdidas] = await Promise.all([
    ventasEnRango(desde, hasta),
    gastosEnRango(desde, hasta),
    perdidasEnRango(desde, hasta),
  ]);

  return {
    ventasTotales: ventas.ventasTotales,
    gananciaBruta: ventas.gananciaBruta,
    gastos,
    perdidas,
    resultado: ventas.gananciaBruta - gastos - perdidas,
    numVentas: ventas.numVentas,
  };
}

export async function calcularResumenCompleto() {
  const now = new Date();
  const fin = endOfDay(now);

  return {
    hoy: await calcularPeriodo(startOfDay(now), fin),
    semana: await calcularPeriodo(startOfWeek(now), fin),
    mes: await calcularPeriodo(startOfMonth(now), fin),
  };
}

export async function topProductos(desde: Date, hasta: Date, limit = 5) {
  const grouped = await prisma.ventaItem.groupBy({
    by: ["productoId"],
    where: {
      venta: { fecha: { gte: desde, lte: hasta }, ...ventaActiva },
    },
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: "desc" } },
    take: limit,
  });

  if (!grouped.length) return [];

  const productos = await prisma.producto.findMany({
    where: { id: { in: grouped.map((g) => g.productoId) } },
  });
  const nombres = new Map(productos.map((p) => [p.id, p.nombre]));

  return grouped.map((g) => ({
    nombre: nombres.get(g.productoId) ?? "Desconocido",
    cantidad: g._sum.cantidad ?? 0,
  }));
}

export async function productosPorReponer() {
  const productos = await prisma.producto.findMany({ orderBy: { nombre: "asc" } });
  return productos.filter((p) => p.cantidad <= p.stockMinimo);
}

export async function ventasPorDia(dias: number) {
  const result: { fecha: string; ventas: number; ganancia: number }[] = [];
  const now = new Date();

  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const desde = startOfDay(d);
    const hasta = endOfDay(d);
    const items = await prisma.ventaItem.findMany({
      where: { venta: { fecha: { gte: desde, lte: hasta }, ...ventaActiva } },
    });
    const ventas = items.reduce((s, it) => s + it.precioUnitario * it.cantidad, 0);
    const costos = items.reduce((s, it) => s + it.costoUnitario * it.cantidad, 0);
    result.push({
      fecha: desde.toISOString().slice(0, 10),
      ventas,
      ganancia: ventas - costos,
    });
  }

  return result;
}
