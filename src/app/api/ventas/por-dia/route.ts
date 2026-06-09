import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchResumenDia, fetchVentasDetalle } from "@/lib/ventas";
import { parseDateInput } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fechaParam = searchParams.get("fecha");

  if (fechaParam) {
    const fecha = parseDateInput(fechaParam);
    const [ventas, resumen] = await Promise.all([
      fetchVentasDetalle({ fecha: fechaParam }),
      fetchResumenDia(fecha),
    ]);

    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = fecha.getFullYear();

    return NextResponse.json({
      fecha: `${day}/${month}/${year}`,
      fechaParam,
      ...resumen,
      ventas,
    });
  }

  const ventas = await prisma.ventaItem.findMany({
    include: { venta: true },
    orderBy: { venta: { fecha: "desc" } },
  });

  const uniqueDays = [...new Set(ventas.map((v) => v.venta.fecha.toISOString().slice(0, 10)))];

  const dias = await Promise.all(
    uniqueDays.map(async (key) => {
      const d = parseDateInput(key);
      const resumen = await fetchResumenDia(d);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return {
        fecha: `${day}/${month}/${year}`,
        fechaParam: key,
        ...resumen,
      };
    })
  );

  dias.sort((a, b) => b.fechaParam.localeCompare(a.fechaParam));

  return NextResponse.json({ dias });
}
