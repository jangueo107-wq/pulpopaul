import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, parseBody, serverError } from "@/lib/api-helpers";

export async function GET() {
  const compras = await prisma.compra.findMany({
    include: {
      items: { include: { producto: true } },
    },
    orderBy: { fecha: "desc" },
    take: 50,
  });
  return NextResponse.json(compras);
}

export async function POST(request: Request) {
  const body = await parseBody<{
    proveedor?: string;
    notas?: string;
    fecha?: string;
    items?: { productoId: string; cantidad: number; costoUnitario?: number }[];
  }>(request);

  if (!body?.items?.length) {
    return badRequest("Agrega al menos un producto");
  }

  try {
    const compra = await prisma.$transaction(async (tx) => {
      const productos = await tx.producto.findMany({
        where: { id: { in: body.items!.map((i) => i.productoId) } },
      });
      const map = new Map(productos.map((p) => [p.id, p]));

      const nuevaCompra = await tx.compra.create({
        data: {
          proveedor: body.proveedor?.trim() || null,
          notas: body.notas?.trim() || null,
          fecha: new Date(),
          items: {
            create: body.items!.map((item) => {
              const producto = map.get(item.productoId);
              const costo = item.costoUnitario ?? producto?.costoCompra ?? 0;
              return {
                productoId: item.productoId,
                cantidad: item.cantidad,
                costoUnitario: costo,
              };
            }),
          },
        },
        include: { items: { include: { producto: true } } },
      });

      for (const item of body.items!) {
        const producto = map.get(item.productoId);
        const costo = item.costoUnitario ?? producto?.costoCompra;

        await tx.producto.update({
          where: { id: item.productoId },
          data: {
            cantidad: { increment: item.cantidad },
            ...(costo != null ? { costoCompra: costo } : {}),
          },
        });
      }

      return nuevaCompra;
    });

    return NextResponse.json(compra, { status: 201 });
  } catch {
    return serverError("No se pudo registrar la compra");
  }
}
