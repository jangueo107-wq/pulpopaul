import { NextResponse } from "next/server";
import {
  calcularResumenCompleto,
  productosPorReponer,
  topProductos,
} from "@/lib/stats";
import { endOfDay, startOfDay, startOfWeek } from "@/lib/dates";

export async function GET() {
  const now = new Date();
  const fin = endOfDay(now);

  const [periodos, topHoy, topSemana, porReponer] = await Promise.all([
    calcularResumenCompleto(),
    topProductos(startOfDay(now), fin, 5),
    topProductos(startOfWeek(now), fin, 5),
    productosPorReponer(),
  ]);

  return NextResponse.json({
    periodos,
    topHoy,
    topSemana,
    porReponer,
  });
}
