import { prisma } from "@/lib/db";

/** Solo ventas que cuentan en estadísticas y totales */
export const ventaActiva = { estado: "ACTIVA" as const };

export function esVentaActiva(estado: string) {
  return estado === "ACTIVA";
}
