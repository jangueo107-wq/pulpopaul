import { NextResponse } from "next/server";
import { changePassword, getSession, requireAuth } from "@/lib/auth";
import { badRequest, parseBody, unauthorized } from "@/lib/api-helpers";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return NextResponse.json({ username: session.username });
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await parseBody<{ currentPassword?: string; newPassword?: string }>(request);

    if (!body?.currentPassword || !body?.newPassword) {
      return badRequest("Contraseña actual y nueva son requeridas");
    }

    const result = await changePassword(
      session.username,
      body.currentPassword,
      body.newPassword
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return unauthorized();
  }
}
