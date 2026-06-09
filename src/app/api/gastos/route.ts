import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, parseBody } from "@/lib/api-helpers";

export async function GET() {
  const gastos = await prisma.gasto.findMany({ orderBy: { fecha: "desc" }, take: 100 });
  return NextResponse.json(gastos);
}

export async function POST(request: Request) {
  const body = await parseBody<{
    concepto?: string;
    monto?: number;
    categoria?: string;
  }>(request);

  if (!body?.concepto || body.monto == null) {
    return badRequest("Concepto y monto requeridos");
  }

  const gasto = await prisma.gasto.create({
    data: {
      concepto: body.concepto.trim(),
      monto: Number(body.monto),
      categoria: body.categoria?.trim() || null,
      fecha: new Date(),
    },
  });

  return NextResponse.json(gasto, { status: 201 });
}
