import { NextResponse } from "next/server";
import { createSession, verifyCredentials } from "@/lib/auth";
import { badRequest, parseBody } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const body = await parseBody<{ username?: string; password?: string }>(request);
  if (!body?.username || !body?.password) {
    return badRequest("Usuario y contraseña requeridos");
  }

  const valid = await verifyCredentials(body.username, body.password);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  await createSession(body.username);
  return NextResponse.json({ ok: true });
}
