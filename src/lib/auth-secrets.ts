/** Hashes bcrypt — nunca texto plano en el repo. */
export const DEFAULT_MAIN_PASSWORD_HASH =
  process.env.MASTER_PASSWORD_HASH ??
  "$2b$12$xRNVpGvp.qdnpik.EWsgmeJIsm9/emkjWncQg38qtuR8upsZ3gwSe";

export const DEFAULT_RECOVERY_PASSWORD_HASH =
  process.env.RECOVERY_PASSWORD_HASH ??
  "$2b$12$9GHO4kL2HyunozBvrfgLVuIMadfTIB0MXYDceGt7flw0bu7omhdqO";

export const DEFAULT_USERNAME = "PulpoPaul";
