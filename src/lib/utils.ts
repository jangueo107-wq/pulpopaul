export const UNIDADES = [
  { value: "BOTELLA", label: "Botella" },
  { value: "LATA", label: "Lata" },
  { value: "KILO", label: "Kilo" },
  { value: "UNIDAD", label: "Unidad" },
  { value: "VASO", label: "Vaso" },
] as const;

export const TIPOS_PERDIDA = [
  { value: "VENCIDO", label: "Vencido" },
  { value: "ROTO", label: "Roto" },
  { value: "DERRAMADO", label: "Derramado" },
  { value: "REGALADO", label: "Regalado" },
  { value: "OTRO", label: "Otro" },
] as const;

export const CATEGORIAS_GASTO = [
  "Electricidad",
  "Agua",
  "Gas",
  "Limpieza",
  "Transporte",
  "Arriendo",
  "Nómina",
  "Otro",
];

export const CATEGORIAS_PRODUCTO = [
  "CERVEZA",
  "GASEOSA",
  "HIDRATACION",
  "LICOR",
  "GRANIZADO",
  "CIGARRILLO",
];

/** Formato: COP 12.500 */
export function formatMoney(amount: number) {
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `COP ${formatted}`;
}

/** Formato: 12.500 (solo número) */
export function formatNumber(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/** dd/mm/yyyy */
export function formatDateCO(date: Date | string) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** hh:mm (24h) */
export function formatTimeCO(date: Date | string) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDateTimeCO(date: Date | string) {
  return `${formatDateCO(date)} ${formatTimeCO(date)}`;
}

export function formatDate(date: Date | string) {
  return formatDateTimeCO(date);
}

export function formatTime(date: Date | string) {
  return formatTimeCO(date);
}

export function formatUnidad(unidad: string) {
  return UNIDADES.find((u) => u.value === unidad)?.label ?? unidad;
}

export function formatTipoPerdida(tipo: string) {
  return TIPOS_PERDIDA.find((t) => t.value === tipo)?.label ?? tipo;
}

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function parseDateInput(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
