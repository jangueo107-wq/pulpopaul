import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, parseBody } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const body = await parseBody<{ productoId?: string; cantidad?: number }>(request);

  if (!body?.productoId || !body.cantidad || body.cantidad <= 0) {
    return badRequest("Producto y cantidad válida requeridos");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: body.productoId } });
      if (!producto) throw new Error("Producto no encontrado");

      const compra = await tx.compra.create({
        data: {
          proveedor: "Carga de stock",
          notas: `Recarga rápida — ${producto.nombre}`,
          fecha: new Date(),
          items: {
            create: {
              productoId: body.productoId!,
              cantidad: body.cantidad!,
              costoUnitario: producto.costoCompra,
            },
          },
        },
      });

      const updated = await tx.producto.update({
        where: { id: body.productoId },
        data: { cantidad: { increment: body.cantidad! } },
      });

      return { compra, producto: updated };
    });

    return NextResponse.json({
      ok: true,
      producto: result.producto.nombre,
      cantidad: body.cantidad,
      cantidadActual: result.producto.cantidad,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar stock";
    return badRequest(message);
  }
}
