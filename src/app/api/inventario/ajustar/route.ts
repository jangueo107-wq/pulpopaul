import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { badRequest, parseBody, unauthorized } from "@/lib/api-helpers";
import { ajustarInventario, mapAjuste } from "@/lib/inventario-ajustes";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await parseBody<{
      productoId?: string;
      modo?: "exacta" | "delta";
      cantidadNueva?: number;
      delta?: number;
      motivo?: string;
    }>(request);

    if (!body?.productoId || !body.modo) {
      return badRequest("Producto y modo de ajuste requeridos");
    }

    const result = await ajustarInventario({
      productoId: body.productoId,
      modo: body.modo,
      cantidadNueva: body.cantidadNueva,
      delta: body.delta,
      motivo: body.motivo,
      usuario: session.username,
    });

    return NextResponse.json({
      ok: true,
      ajuste: mapAjuste(result.ajuste),
      cantidadActual: result.producto.cantidad,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorized();
    }
    const message = error instanceof Error ? error.message : "Error al ajustar inventario";
    return badRequest(message);
  }
}
