"use client";

import { useEffect, useState } from "react";
import { cn, formatMoney } from "@/lib/utils";

type PeriodStats = {
  ventasTotales: number;
  gananciaBruta: number;
  gastos: number;
  perdidas: number;
  resultado: number;
  numVentas: number;
};

export function PeriodPanel({
  title,
  stats,
}: {
  title: string;
  stats: PeriodStats;
}) {
  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Ventas totales" value={formatMoney(stats.ventasTotales)} tone="sales" />
        <MetricCard label="Utilidad bruta" value={formatMoney(stats.gananciaBruta)} tone="profit" />
        <MetricCard label="Gastos" value={formatMoney(stats.gastos)} tone="expense" />
        <MetricCard label="Pérdidas" value={formatMoney(stats.perdidas)} tone="expense" />
        <MetricCard
          label="Resultado neto"
          value={formatMoney(stats.resultado)}
          tone={stats.resultado >= 0 ? "profit" : "expense"}
        />
        <MetricCard label="Nº ventas" value={String(stats.numVentas)} tone="neutral" />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "sales" | "profit" | "expense" | "neutral";
}) {
  const tones = {
    sales: "border-fuchsia-100 bg-fuchsia-50/50",
    profit: "border-emerald-100 bg-emerald-50/50",
    expense: "border-red-100 bg-red-50/50",
    neutral: "border-slate-100 bg-slate-50/50",
  };
  const valueColors = {
    sales: "text-brand-purple",
    profit: "text-emerald-700",
    expense: "text-red-700",
    neutral: "text-slate-800",
  };

  return (
    <div className={cn("rounded-xl border p-4", tones[tone])}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className={cn("stat-value mt-1", valueColors[tone])}>{value}</p>
    </div>
  );
}

export function Toast({
  message,
  type = "success",
  onDone,
}: {
  message: string;
  type?: "success" | "error";
  onDone?: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-base font-medium shadow-lg md:bottom-8",
        type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      )}
    >
      {message}
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-20 text-base text-slate-500">
      Cargando...
    </div>
  );
}

export function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-base text-slate-500">
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  function show(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  const ToastEl = toast ? (
    <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
  ) : null;

  return { show, Toast: ToastEl };
}
