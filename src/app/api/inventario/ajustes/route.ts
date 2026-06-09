import { NextResponse } from "next/server";
import { listarAjustes } from "@/lib/inventario-ajustes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productoId = searchParams.get("productoId");
  const fecha = searchParams.get("fecha");
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const ajustes = await listarAjustes({ productoId, fecha, desde, hasta });
  return NextResponse.json({ ajustes });
}
