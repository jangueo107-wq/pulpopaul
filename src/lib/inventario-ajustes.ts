import { prisma } from "@/lib/db";
import { endOfDay, startOfDay } from "@/lib/dates";
import { parseDateInput } from "@/lib/utils";

export type AjusteInput = {
  productoId: string;
  modo: "exacta" | "delta";
  cantidadNueva?: number;
  delta?: number;
  motivo?: string;
  usuario?: string;
};

export async function ajustarInventario(input: AjusteInput) {
  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUnique({ where: { id: input.productoId } });
    if (!producto) throw new Error("Producto no encontrado");

    const anterior = producto.cantidad;
    let nueva: number;

    if (input.modo === "exacta") {
      if (input.cantidadNueva == null || input.cantidadNueva < 0) {
        throw new Error("La cantidad nueva debe ser 0 o mayor");
      }
      nueva = input.cantidadNueva;
    } else {
      if (input.delta == null || input.delta === 0) {
        throw new Error("El ajuste debe ser distinto de cero");
      }
      nueva = anterior + input.delta;
      if (nueva < 0) throw new Error("El stock no puede quedar negativo");
    }

    const diferencia = nueva - anterior;

    if (diferencia === 0) {
      throw new Error("No hay cambio en la cantidad");
    }

    const ajuste = await tx.ajusteInventario.create({
      data: {
        productoId: input.productoId,
        cantidadAnterior: anterior,
        cantidadNueva: nueva,
        diferencia,
        motivo: input.motivo?.trim() || null,
        usuario: input.usuario || null,
      },
      include: { producto: { select: { nombre: true } } },
    });

    const updated = await tx.producto.update({
      where: { id: input.productoId },
      data: { cantidad: nueva },
    });

    return { ajuste, producto: updated };
  });
}

export function mapAjuste(ajuste: {
  id: string;
  productoId: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  diferencia: number;
  motivo: string | null;
  usuario: string | null;
  createdAt: Date;
  producto: { nombre: string };
}) {
  const d = ajuste.createdAt;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return {
    id: ajuste.id,
    productoId: ajuste.productoId,
    producto: ajuste.producto.nombre,
    cantidadAnterior: ajuste.cantidadAnterior,
    cantidadNueva: ajuste.cantidadNueva,
    diferencia: ajuste.diferencia,
    motivo: ajuste.motivo,
    usuario: ajuste.usuario,
    fecha: `${day}/${month}/${year}`,
    hora: `${hours}:${minutes}`,
    fechaParam: d.toISOString().slice(0, 10),
    createdAt: d.toISOString(),
  };
}

export async function listarAjustes(params: {
  productoId?: string | null;
  fecha?: string | null;
  desde?: string | null;
  hasta?: string | null;
}) {
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (params.fecha) {
    const d = parseDateInput(params.fecha);
    dateFilter.gte = startOfDay(d);
    dateFilter.lte = endOfDay(d);
  } else {
    if (params.desde) dateFilter.gte = startOfDay(parseDateInput(params.desde));
    if (params.hasta) dateFilter.lte = endOfDay(parseDateInput(params.hasta));
  }

  const ajustes = await prisma.ajusteInventario.findMany({
    where: {
      ...(params.productoId ? { productoId: params.productoId } : {}),
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    },
    include: { producto: { select: { nombre: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ajustes.map(mapAjuste);
}
