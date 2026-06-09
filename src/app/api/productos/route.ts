import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, parseBody, serverError } from "@/lib/api-helpers";
import type { Unidad } from "@prisma/client";

export async function GET() {
  const productos = await prisma.producto.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json(productos);
}

export async function POST(request: Request) {
  const body = await parseBody<{
    nombre?: string;
    categoria?: string;
    precioVenta?: number;
    costoCompra?: number;
    proveedor?: string;
    unidad?: Unidad;
    cantidad?: number;
    stockMinimo?: number;
  }>(request);

  if (!body?.nombre || !body.categoria || body.precioVenta == null || body.costoCompra == null) {
    return badRequest("Completa nombre, categoría, precio y costo");
  }

  try {
    const producto = await prisma.producto.create({
      data: {
        nombre: body.nombre.trim(),
        categoria: body.categoria.trim(),
        precioVenta: Number(body.precioVenta),
        costoCompra: Number(body.costoCompra),
        proveedor: body.proveedor?.trim() ?? "",
        unidad: body.unidad ?? "UNIDAD",
        cantidad: Number(body.cantidad ?? 0),
        stockMinimo: Number(body.stockMinimo ?? 0),
      },
    });
    return NextResponse.json(producto, { status: 201 });
  } catch {
    return serverError("No se pudo crear el producto");
  }
}
