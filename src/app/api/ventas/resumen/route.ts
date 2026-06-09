import { NextResponse } from "next/server";
import { calcularPeriodo } from "@/lib/stats";
import { endOfDay, startOfDay } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { ventaActiva } from "@/lib/venta-filters";

export async function GET() {
  const now = new Date();
  const stats = await calcularPeriodo(startOfDay(now), endOfDay(now));

  const ventas = await prisma.venta.findMany({
    where: {
      fecha: { gte: startOfDay(now), lte: endOfDay(now) },
      ...ventaActiva,
    },
    include: {
      items: { include: { producto: { select: { nombre: true } } } },
    },
    orderBy: { fecha: "desc" },
    take: 20,
  });

  return NextResponse.json({ stats, ventas });
}
