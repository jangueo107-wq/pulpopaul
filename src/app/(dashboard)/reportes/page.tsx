"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

type ReportData = {
  resumen: { dia: PeriodStats; semana: PeriodStats; mes: PeriodStats };
  masVendidos: { nombre: string; cantidad: number }[];
  porReponer: { id: string; nombre: string; cantidad: number; stockMinimo: number }[];
  grafico: { fecha: string; ventas: number; ganancia: number }[];
};

export default function ReportesPage() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/reportes").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <LoadingBlock />;

  const chartData = data.grafico.map((d) => ({
    ...d,
    label: d.fecha.slice(5),
    ventasK: Math.round(d.ventas / 1000),
    gananciaK: Math.round(d.ganancia / 1000),
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Ganancias, gastos, pérdidas y tendencias</p>
      </header>

      <PeriodPanel title="Resumen — Hoy" stats={data.resumen.dia} />
      <PeriodPanel title="Resumen — Semana" stats={data.resumen.semana} />
      <PeriodPanel title="Resumen — Mes" stats={data.resumen.mes} />

      <section className="card">
        <h2 className="text-lg font-bold text-slate-900">Ventas y ganancia — últimos 14 días</h2>
        <p className="mt-1 text-sm text-slate-500">Valores en miles de COP</p>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "ventasK" ? formatMoney(value * 1000) : formatMoney(value * 1000),
                  name === "ventasK" ? "Ventas" : "Ganancia",
                ]}
              />
              <Legend />
              <Bar dataKey="ventasK" name="Ventas" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gananciaK" name="Ganancia" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold text-slate-900">Tendencia de ganancia</h2>
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [formatMoney(value * 1000), "Ganancia"]}
              />
              <Line
                type="monotone"
                dataKey="gananciaK"
                name="Ganancia"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-bold text-slate-900">Más vendidos (mes)</h2>
          {data.masVendidos.length === 0 ? (
            <EmptyBlock message="Sin datos de ventas." />
          ) : (
            <ol className="mt-4 space-y-2 text-base">
              {data.masVendidos.map((p, i) => (
                <li key={p.nombre} className="flex justify-between">
                  <span>
                    {i + 1}. {p.nombre}
                  </span>
                  <span className="font-semibold">{p.cantidad} uds.</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card">
          <h2 className="text-lg font-bold text-slate-900">Por reponer</h2>
          {data.porReponer.length === 0 ? (
            <p className="mt-3 text-base text-slate-500">Inventario OK.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {data.porReponer.map((p) => (
                <li key={p.id} className="flex justify-between py-2 text-base">
                  <span>{p.nombre}</span>
                  <span className="badge badge-danger">
                    {p.cantidad} / {p.stockMinimo}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
