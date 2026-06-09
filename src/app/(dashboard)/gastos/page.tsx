"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyBlock, LoadingBlock, useToast } from "@/components/ui";
import { CATEGORIAS_GASTO, formatDate, formatMoney } from "@/lib/utils";

type Gasto = {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  categoria: string | null;
};

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [form, setForm] = useState({ concepto: "", monto: "", categoria: "Otro" });
  const [loading, setLoading] = useState(true);
  const { show, Toast } = useToast();

  async function load() {
    setGastos(await (await fetch("/api/gastos")).json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concepto: form.concepto,
        monto: Number(form.monto),
        categoria: form.categoria,
      }),
    });

    if (res.ok) {
      show("Gasto registrado");
      setForm({ concepto: "", monto: "", categoria: "Otro" });
      load();
    } else {
      show("Error al registrar", "error");
    }
  }

  const total = gastos.reduce((s, g) => s + g.monto, 0);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      {Toast}
      <header>
        <h1 className="page-title">Gastos</h1>
        <p className="page-subtitle">Gastos operativos del negocio — fecha automática</p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Concepto</label>
          <input
            className="input"
            placeholder="Ej: Factura de luz"
            value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Monto (COP)</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select
              className="input"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {CATEGORIAS_GASTO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Registrar gasto
        </button>
      </form>

      <div className="card border-red-100 bg-red-50/40">
        <p className="text-sm font-medium text-slate-600">Total registrado (historial)</p>
        <p className="stat-value text-red-700">{formatMoney(total)}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Gastos recientes</h2>
        {gastos.length === 0 ? (
          <EmptyBlock message="Sin gastos registrados." />
        ) : (
          gastos.map((g) => (
            <div key={g.id} className="card flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-lg font-semibold text-slate-900">{g.concepto}</p>
                <p className="text-base text-slate-500">
                  {formatDate(g.fecha)} · {g.categoria}
                </p>
              </div>
              <p className="text-lg font-bold text-red-700">{formatMoney(g.monto)}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
