import { NextResponse } from "next/server";
import { buildResumenPorDia, fetchVentasDetalle } from "@/lib/ventas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const ventas = await fetchVentasDetalle({ fecha, desde, hasta });
  const resumenPorDia = buildResumenPorDia(ventas);

  return NextResponse.json({ ventas, resumenPorDia });
}
