import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_MAIN_PASSWORD_HASH,
  DEFAULT_RECOVERY_PASSWORD_HASH,
  DEFAULT_USERNAME,
} from "../src/lib/auth-secrets";

const prisma = new PrismaClient();

async function main() {
  await prisma.usuario.deleteMany({ where: { username: "admin" } });
  await prisma.usuario.upsert({
    where: { username: DEFAULT_USERNAME },
    update: {
      passwordHash: DEFAULT_MAIN_PASSWORD_HASH,
      recoveryHash: DEFAULT_RECOVERY_PASSWORD_HASH,
    },
    create: {
      username: DEFAULT_USERNAME,
      passwordHash: DEFAULT_MAIN_PASSWORD_HASH,
      recoveryHash: DEFAULT_RECOVERY_PASSWORD_HASH,
    },
  });
  console.log("✓ Usuario PulpoPaul actualizado (contraseña principal + clave de recuperación)");
}

main()
  .finally(() => prisma.$disconnect());
