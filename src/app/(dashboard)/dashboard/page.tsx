"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { EmptyBlock, LoadingBlock, PeriodPanel } from "@/components/ui";
import { formatMoney } from "@/lib/utils";

type PeriodStats = {
  ventasTotales: number;
  gananciaBruta: number;
  gastos: number;
  perdidas: number;
  resultado: number;
  numVentas: number;
};

type DashboardData = {
  periodos: { hoy: PeriodStats; semana: PeriodStats; mes: PeriodStats };
  topHoy: { nombre: string; cantidad: number }[];
  topSemana: { nombre: string; cantidad: number }[];
  porReponer: {
    id: string;
    nombre: string;
    cantidad: number;
    stockMinimo: number;
    categoria: string;
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <header className="card overflow-hidden border-purple-100 bg-gradient-to-r from-brand-dark to-purple-900 p-6 text-white">
        <Logo size="md" variant="dark" showText />
        <p className="mt-4 text-purple-100">Resumen de ventas, utilidad, gastos y pérdidas</p>
      </header>

      <PeriodPanel title="Hoy" stats={data.periodos.hoy} />
      <PeriodPanel title="Esta semana" stats={data.periodos.semana} />
      <PeriodPanel title="Este mes" stats={data.periodos.mes} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingCard title="Más vendidos hoy" items={data.topHoy} />
        <RankingCard title="Más vendidos esta semana" items={data.topSemana} />
      </div>

      <section className="card">
        <h2 className="text-lg font-bold text-slate-900">Productos por reponer</h2>
        {data.porReponer.length === 0 ? (
          <p className="mt-3 text-base text-slate-500">Todo el inventario está en buen nivel.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {data.porReponer.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-slate-900">{p.nombre}</p>
                  <p className="text-sm text-slate-500">{p.categoria}</p>
                </div>
                <span className="badge badge-danger">
                  {p.cantidad} / mín {p.stockMinimo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RankingCard({
  title,
  items,
}: {
  title: string;
  items: { nombre: string; cantidad: number }[];
}) {
  return (
    <section className="card">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <EmptyBlock message="Sin ventas en este periodo." />
      ) : (
        <ol className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={item.nombre} className="flex items-center justify-between text-base">
              <span className="text-slate-700">
                <span className="mr-2 font-bold text-brand-accent">{i + 1}.</span>
                {item.nombre}
              </span>
              <span className="font-semibold text-slate-900">{item.cantidad} uds.</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
