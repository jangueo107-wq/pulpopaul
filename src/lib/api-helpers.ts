import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Error interno") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
