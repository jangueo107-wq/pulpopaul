export type CategoriaKey =
  | "cerveza"
  | "gaseosa"
  | "hidratacion"
  | "licor"
  | "granizado"
  | "cigarrillo"
  | "otro";

export const CATEGORIAS = [
  { value: "CERVEZA", key: "cerveza" as const, label: "Cervezas" },
  { value: "GASEOSA", key: "gaseosa" as const, label: "Gaseosas" },
  { value: "HIDRATACION", key: "hidratacion" as const, label: "Agua / Hidratación" },
  { value: "LICOR", key: "licor" as const, label: "Licores" },
  { value: "GRANIZADO", key: "granizado" as const, label: "Granizados" },
  { value: "CIGARRILLO", key: "cigarrillo" as const, label: "Cigarrillos" },
];

export const CATEGORIAS_FILTRO = ["Todas", ...CATEGORIAS.map((c) => c.value)];

export const CATEGORIAS_VENTA = CATEGORIAS.map((c) => c.value);

export function getCategoriaKey(categoria: string): CategoriaKey {
  const upper = categoria.toUpperCase();
  if (upper === "CERVEZA" || upper === "CERVEZAS") return "cerveza";
  if (upper === "GASEOSA" || upper === "GASEOSAS") return "gaseosa";
  if (upper === "HIDRATACION" || upper.includes("HIDRAT")) return "hidratacion";
  if (upper === "LICOR" || upper === "LICORES") return "licor";
  if (upper === "GRANIZADO" || upper === "GRANIZADOS") return "granizado";
  if (upper === "CIGARRILLO" || upper === "CIGARRILLOS") return "cigarrillo";
  return "otro";
}

export const CATEGORIA_STYLES: Record<
  CategoriaKey,
  { bg: string; border: string; text: string; badge: string; emoji: string }
> = {
  cerveza: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
    emoji: "🍺",
  },
  gaseosa: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    badge: "bg-red-100 text-red-800 border-red-200",
    emoji: "🥤",
  },
  hidratacion: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-800",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    emoji: "💧",
  },
  licor: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-900",
    badge: "bg-violet-100 text-violet-900 border-violet-200",
    emoji: "🥃",
  },
  granizado: {
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-200",
    text: "text-fuchsia-900",
    badge: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200",
    emoji: "🧊",
  },
  cigarrillo: {
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-800",
    badge: "bg-slate-200 text-slate-800 border-slate-300",
    emoji: "🚬",
  },
  otro: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    emoji: "•",
  },
};

export const PROVEEDORES: Record<string, string> = {
  CERVEZA: "Distribuidora Cervezas CO",
  GASEOSA: "Bebidas Gaseosas CO",
  HIDRATACION: "Hidratación CO",
  LICOR: "Licores Colombia",
  GRANIZADO: "Insumos Granizados CO",
  CIGARRILLO: "Tabaco CO",
};

export function getCategoriaStyle(categoria: string) {
  return CATEGORIA_STYLES[getCategoriaKey(categoria)];
}

export function getStockColor(cantidad: number, stockMinimo: number) {
  if (cantidad === 0) return "text-red-700";
  if (cantidad <= stockMinimo) return "text-amber-600";
  return "text-emerald-700";
}

export function getStockBg(cantidad: number, stockMinimo: number) {
  if (cantidad === 0) return "bg-red-50 border-red-200";
  if (cantidad <= stockMinimo) return "bg-amber-50 border-amber-200";
  return "bg-emerald-50 border-emerald-200";
}
