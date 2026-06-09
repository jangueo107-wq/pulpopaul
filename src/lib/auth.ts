import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "paul_session";
const SALT_ROUNDS = 12;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está configurado");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function matchesPrimaryOrRecovery(
  input: string,
  user: { passwordHash: string; recoveryHash: string }
) {
  if (await bcrypt.compare(input, user.passwordHash)) return true;
  return bcrypt.compare(input, user.recoveryHash);
}

export async function verifyCredentials(username: string, password: string) {
  const user = await prisma.usuario.findUnique({ where: { username } });
  if (!user) return false;
  return matchesPrimaryOrRecovery(password, user);
}

export async function changePassword(
  username: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.usuario.findUnique({ where: { username } });
  if (!user) return { ok: false as const, error: "Usuario no encontrado" };

  const valid = await matchesPrimaryOrRecovery(currentPassword, user);
  if (!valid) return { ok: false as const, error: "Contraseña actual incorrecta" };

  if (newPassword.length < 6) {
    return { ok: false as const, error: "La nueva contraseña debe tener al menos 6 caracteres" };
  }

  await prisma.usuario.update({
    where: { username },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { ok: true as const };
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { username: payload.username as string };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
