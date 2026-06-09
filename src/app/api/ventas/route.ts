import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, parseBody, serverError } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");

  const where = fecha
    ? {
        fecha: {
          gte: new Date(`${fecha}T00:00:00`),
          lte: new Date(`${fecha}T23:59:59.999`),
        },
      }
    : {};

  const ventas = await prisma.venta.findMany({
    where,
    include: {
      items: { include: { producto: true } },
    },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json(ventas);
}

export async function POST(request: Request) {
  const body = await parseBody<{
    notas?: string;
    fecha?: string;
    items?: { productoId: string; cantidad: number }[];
  }>(request);

  if (!body?.items?.length) {
    return badRequest("Agrega al menos un producto a la venta");
  }

  try {
    const venta = await prisma.$transaction(async (tx) => {
      const productos = await tx.producto.findMany({
        where: { id: { in: body.items!.map((i) => i.productoId) } },
      });

      const map = new Map(productos.map((p) => [p.id, p]));

      for (const item of body.items!) {
        const producto = map.get(item.productoId);
        if (!producto) throw new Error("Producto no encontrado");
        if (producto.cantidad < item.cantidad) {
          throw new Error(`Stock insuficiente: ${producto.nombre}`);
        }
      }

      const nuevaVenta = await tx.venta.create({
        data: {
          notas: body.notas?.trim() || null,
          fecha: body.fecha ? new Date(body.fecha) : new Date(),
          items: {
            create: body.items!.map((item) => {
              const producto = map.get(item.productoId)!;
              return {
                productoId: item.productoId,
                cantidad: item.cantidad,
                precioUnitario: producto.precioVenta,
                costoUnitario: producto.costoCompra,
              };
            }),
          },
        },
        include: { items: { include: { producto: true } } },
      });

      for (const item of body.items!) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { cantidad: { decrement: item.cantidad } },
        });
      }

      return nuevaVenta;
    });

    return NextResponse.json(venta, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al registrar venta";
    return badRequest(message);
  }
}
