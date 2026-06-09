import { NextResponse } from "next/server";
import { badRequest, parseBody } from "@/lib/api-helpers";
import { anularVenta } from "@/lib/ventas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await parseBody<{ motivo?: string }>(request);
  const motivo = body?.motivo?.trim() || "Vendido por error";

  try {
    const venta = await anularVenta(id, motivo);
    return NextResponse.json(venta);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo anular";
    return badRequest(message);
  }
}
