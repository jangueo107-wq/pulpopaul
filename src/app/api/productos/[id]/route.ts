import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, parseBody, serverError } from "@/lib/api-helpers";
import type { Unidad } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await parseBody<{
    nombre?: string;
    categoria?: string;
    precioVenta?: number;
    costoCompra?: number;
    proveedor?: string;
    unidad?: Unidad;
    stockMinimo?: number;
  }>(request);

  if (!body?.nombre || !body.categoria || body.precioVenta == null || body.costoCompra == null) {
    return badRequest("Datos incompletos");
  }

  try {
    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre: body.nombre.trim(),
        categoria: body.categoria.trim(),
        precioVenta: Number(body.precioVenta),
        costoCompra: Number(body.costoCompra),
        proveedor: body.proveedor?.trim() ?? "",
        unidad: body.unidad ?? "UNIDAD",
        stockMinimo: Number(body.stockMinimo ?? 0),
      },
    });
    return NextResponse.json(producto);
  } catch {
    return serverError("No se pudo actualizar");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.producto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return serverError("No se pudo eliminar. Puede tener ventas asociadas.");
  }
}
