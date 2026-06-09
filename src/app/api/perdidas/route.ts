import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, parseBody } from "@/lib/api-helpers";
import type { TipoPerdida } from "@prisma/client";

export async function GET() {
  const perdidas = await prisma.perdida.findMany({
    include: { producto: true },
    orderBy: { fecha: "desc" },
    take: 100,
  });
  return NextResponse.json(perdidas);
}

export async function POST(request: Request) {
  const body = await parseBody<{
    productoId?: string;
    cantidad?: number;
    tipo?: TipoPerdida;
    notas?: string;
  }>(request);

  if (!body?.productoId || !body.cantidad || !body.tipo) {
    return badRequest("Producto, cantidad y tipo requeridos");
  }

  try {
    const perdida = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: body.productoId } });
      if (!producto) throw new Error("Producto no encontrado");
      if (producto.cantidad < body.cantidad!) {
        throw new Error(`Stock insuficiente: ${producto.nombre}`);
      }

      const registro = await tx.perdida.create({
        data: {
          productoId: body.productoId!,
          cantidad: body.cantidad!,
          costoUnitario: producto.costoCompra,
          tipo: body.tipo!,
          notas: body.notas?.trim() || null,
          fecha: new Date(),
        },
        include: { producto: true },
      });

      await tx.producto.update({
        where: { id: body.productoId },
        data: { cantidad: { decrement: body.cantidad! } },
      });

      return registro;
    });

    return NextResponse.json(perdida, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al registrar pérdida";
    return badRequest(message);
  }
}
