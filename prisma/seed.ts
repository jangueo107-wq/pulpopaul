import { PrismaClient, Unidad } from "@prisma/client";
import { PROVEEDORES } from "../src/lib/categories";
import {
  DEFAULT_MAIN_PASSWORD_HASH,
  DEFAULT_RECOVERY_PASSWORD_HASH,
  DEFAULT_USERNAME,
} from "../src/lib/auth-secrets";

const prisma = new PrismaClient();

type P = {
  nombre: string;
  categoria: keyof typeof PROVEEDORES;
  precioVenta: number;
  costoCompra: number;
  unidad: Unidad;
  cantidad: number;
  stockMinimo: number;
};

const productos: P[] = [
  // CERVEZA
  { nombre: "Poker 330", categoria: "CERVEZA", costoCompra: 2400, precioVenta: 4000, unidad: "LATA", cantidad: 48, stockMinimo: 12 },
  { nombre: "Light 330", categoria: "CERVEZA", costoCompra: 2333, precioVenta: 4500, unidad: "LATA", cantidad: 48, stockMinimo: 12 },
  { nombre: "Tecate 330", categoria: "CERVEZA", costoCompra: 1400, precioVenta: 2500, unidad: "LATA", cantidad: 36, stockMinimo: 12 },
  { nombre: "Club Latín", categoria: "CERVEZA", costoCompra: 3458, precioVenta: 5500, unidad: "BOTELLA", cantidad: 24, stockMinimo: 8 },
  { nombre: "Corona", categoria: "CERVEZA", costoCompra: 3500, precioVenta: 5000, unidad: "BOTELLA", cantidad: 24, stockMinimo: 8 },
  { nombre: "Red lata", categoria: "CERVEZA", costoCompra: 2916, precioVenta: 4500, unidad: "LATA", cantidad: 36, stockMinimo: 12 },
  { nombre: "Cuates lata", categoria: "CERVEZA", costoCompra: 3500, precioVenta: 5000, unidad: "LATA", cantidad: 36, stockMinimo: 12 },
  { nombre: "Tecate 750", categoria: "CERVEZA", costoCompra: 2625, precioVenta: 4500, unidad: "BOTELLA", cantidad: 24, stockMinimo: 8 },
  { nombre: "Poker litro", categoria: "CERVEZA", costoCompra: 4769, precioVenta: 7000, unidad: "BOTELLA", cantidad: 24, stockMinimo: 8 },
  { nombre: "Light litro", categoria: "CERVEZA", costoCompra: 4923, precioVenta: 7500, unidad: "BOTELLA", cantidad: 24, stockMinimo: 8 },
  { nombre: "Poker lata", categoria: "CERVEZA", costoCompra: 2666, precioVenta: 4500, unidad: "LATA", cantidad: 48, stockMinimo: 12 },
  { nombre: "Ázteca lata", categoria: "CERVEZA", costoCompra: 1750, precioVenta: 2500, unidad: "LATA", cantidad: 36, stockMinimo: 12 },
  { nombre: "Costeña 330", categoria: "CERVEZA", costoCompra: 1550, precioVenta: 2500, unidad: "LATA", cantidad: 36, stockMinimo: 12 },

  // GASEOSA
  { nombre: "Coca-Cola 400", categoria: "GASEOSA", costoCompra: 2500, precioVenta: 3500, unidad: "BOTELLA", cantidad: 24, stockMinimo: 6 },
  { nombre: "Postobón 400", categoria: "GASEOSA", costoCompra: 2083, precioVenta: 3000, unidad: "BOTELLA", cantidad: 24, stockMinimo: 6 },
  { nombre: "Postón 1.5", categoria: "GASEOSA", costoCompra: 3750, precioVenta: 5000, unidad: "BOTELLA", cantidad: 12, stockMinimo: 4 },
  { nombre: "Big Cola 400", categoria: "GASEOSA", costoCompra: 1183, precioVenta: 2000, unidad: "BOTELLA", cantidad: 24, stockMinimo: 6 },
  { nombre: "Hit 500", categoria: "GASEOSA", costoCompra: 2500, precioVenta: 3500, unidad: "BOTELLA", cantidad: 18, stockMinimo: 6 },
  { nombre: "Bretaña", categoria: "GASEOSA", costoCompra: 2150, precioVenta: 4000, unidad: "BOTELLA", cantidad: 18, stockMinimo: 6 },

  // HIDRATACION
  { nombre: "Amper", categoria: "HIDRATACION", costoCompra: 2600, precioVenta: 5000, unidad: "BOTELLA", cantidad: 18, stockMinimo: 6 },
  { nombre: "Agua", categoria: "HIDRATACION", costoCompra: 1050, precioVenta: 2000, unidad: "BOTELLA", cantidad: 36, stockMinimo: 12 },
  { nombre: "Gatorade", categoria: "HIDRATACION", costoCompra: 3000, precioVenta: 4500, unidad: "BOTELLA", cantidad: 18, stockMinimo: 6 },
  { nombre: "Electrolit", categoria: "HIDRATACION", costoCompra: 7000, precioVenta: 10000, unidad: "BOTELLA", cantidad: 12, stockMinimo: 4 },

  // LICOR
  { nombre: "Buchana Media", categoria: "LICOR", costoCompra: 86000, precioVenta: 120000, unidad: "BOTELLA", cantidad: 8, stockMinimo: 2 },
  { nombre: "Old Parr Media", categoria: "LICOR", costoCompra: 93000, precioVenta: 120000, unidad: "BOTELLA", cantidad: 8, stockMinimo: 2 },
  { nombre: "Buchana 750", categoria: "LICOR", costoCompra: 148000, precioVenta: 200000, unidad: "BOTELLA", cantidad: 6, stockMinimo: 2 },
  { nombre: "Old Parr 750", categoria: "LICOR", costoCompra: 130000, precioVenta: 190000, unidad: "BOTELLA", cantidad: 6, stockMinimo: 2 },
  { nombre: "Amarillo M", categoria: "LICOR", costoCompra: 25700, precioVenta: 35000, unidad: "BOTELLA", cantidad: 10, stockMinimo: 3 },
  { nombre: "Antioqueño M", categoria: "LICOR", costoCompra: 25500, precioVenta: 35000, unidad: "BOTELLA", cantidad: 10, stockMinimo: 3 },
  { nombre: "Ron M", categoria: "LICOR", costoCompra: 27500, precioVenta: 37000, unidad: "BOTELLA", cantidad: 10, stockMinimo: 3 },

  // GRANIZADO
  { nombre: "Granitado 10 Onz", categoria: "GRANIZADO", costoCompra: 1800, precioVenta: 10000, unidad: "UNIDAD", cantidad: 30, stockMinimo: 5 },
  { nombre: "Granitado 12 Onz", categoria: "GRANIZADO", costoCompra: 2425, precioVenta: 13000, unidad: "UNIDAD", cantidad: 30, stockMinimo: 5 },
  { nombre: "Granitado 16 Onz", categoria: "GRANIZADO", costoCompra: 2800, precioVenta: 16000, unidad: "UNIDAD", cantidad: 25, stockMinimo: 5 },

  // CIGARRILLO
  { nombre: "L&M Red Und", categoria: "CIGARRILLO", costoCompra: 450, precioVenta: 800, unidad: "UNIDAD", cantidad: 60, stockMinimo: 15 },
  { nombre: "L&M Red Media", categoria: "CIGARRILLO", costoCompra: 4000, precioVenta: 6000, unidad: "UNIDAD", cantidad: 20, stockMinimo: 5 },
  { nombre: "L&M Blanco Und", categoria: "CIGARRILLO", costoCompra: 400, precioVenta: 800, unidad: "UNIDAD", cantidad: 60, stockMinimo: 15 },
  { nombre: "Marlboro Fusión Und", categoria: "CIGARRILLO", costoCompra: 720, precioVenta: 1200, unidad: "UNIDAD", cantidad: 50, stockMinimo: 15 },
];

async function main() {
  console.log("Limpiando datos...");
  await prisma.ventaItem.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.compraItem.deleteMany();
  await prisma.compra.deleteMany();
  await prisma.perdida.deleteMany();
  await prisma.gasto.deleteMany();
  await prisma.producto.deleteMany();

  console.log(`Creando usuario ${DEFAULT_USERNAME}...`);
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

  console.log("Creando productos Jangueo...");
  for (const p of productos) {
    await prisma.producto.create({
      data: {
        nombre: p.nombre,
        categoria: p.categoria,
        precioVenta: p.precioVenta,
        costoCompra: p.costoCompra,
        proveedor: PROVEEDORES[p.categoria],
        unidad: p.unidad,
        cantidad: p.cantidad,
        stockMinimo: p.stockMinimo,
      },
    });
  }

  console.log(`✓ Jangueo: ${productos.length} productos cargados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
