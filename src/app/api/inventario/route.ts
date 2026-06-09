import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const productos = await prisma.producto.findMany({
    orderBy: { nombre: "asc" },
  });

  const bajoStock = productos.filter((p) => p.cantidad <= p.stockMinimo);

  return NextResponse.json({ productos, bajoStock, totalAlertas: bajoStock.length });
}
