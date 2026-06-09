import { NextResponse } from "next/server";
import {
  calcularPeriodo,
  calcularResumenCompleto,
  productosPorReponer,
  topProductos,
  ventasPorDia,
} from "@/lib/stats";
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from "@/lib/dates";

export async function GET() {
  const now = new Date();
  const fin = endOfDay(now);
  const inicioDia = startOfDay(now);
  const inicioSemana = startOfWeek(now);
  const inicioMes = startOfMonth(now);

  const [periodos, masVendidos, porReponer, grafico] = await Promise.all([
    calcularResumenCompleto(),
    topProductos(inicioMes, fin, 10),
    productosPorReponer(),
    ventasPorDia(14),
  ]);

  const [dia, semana, mes] = await Promise.all([
    calcularPeriodo(inicioDia, fin),
    calcularPeriodo(inicioSemana, fin),
    calcularPeriodo(inicioMes, fin),
  ]);

  return NextResponse.json({
    resumen: { dia, semana, mes },
    periodos,
    masVendidos,
    porReponer,
    grafico,
  });
}
