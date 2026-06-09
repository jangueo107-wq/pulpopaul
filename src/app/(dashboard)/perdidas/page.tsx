"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyBlock, LoadingBlock, useToast } from "@/components/ui";
import { TIPOS_PERDIDA, formatDate, formatMoney, formatTipoPerdida } from "@/lib/utils";

type Producto = { id: string; nombre: string; cantidad: number; costoCompra: number };

type Perdida = {
  id: string;
  fecha: string;
  cantidad: number;
  costoUnitario: number;
  tipo: string;
  notas: string | null;
  producto: { nombre: string };
};

export default function PerdidasPage() {
  const [perdidas, setPerdidas] = useState<Perdida[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState({
    productoId: "",
    cantidad: "1",
    tipo: "VENCIDO",
    notas: "",
  });
  const [loading, setLoading] = useState(true);
  const { show, Toast } = useToast();

  async function load() {
    const [p, prod] = await Promise.all([
      fetch("/api/perdidas").then((r) => r.json()),
      fetch("/api/productos").then((r) => r.json()),
    ]);
    setPerdidas(p);
    setProductos(prod);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/perdidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productoId: form.productoId,
        cantidad: Number(form.cantidad),
        tipo: form.tipo,
        notas: form.notas,
      }),
    });

    if (res.ok) {
      show("Pérdida registrada");
      setForm({ productoId: "", cantidad: "1", tipo: "VENCIDO", notas: "" });
      load();
    } else {
      const err = await res.json();
      show(err.error ?? "Error", "error");
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      {Toast}
      <header>
        <h1 className="page-title">Pérdidas</h1>
        <p className="page-subtitle">
          Mermas de producto — descuenta inventario automáticamente
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Producto</label>
          <select
            className="input"
            value={form.productoId}
            onChange={(e) => setForm({ ...form, productoId: e.target.value })}
            required
          >
            <option value="">Seleccionar</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (stock: {p.cantidad})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Cantidad</label>
            <input
              type="number"
              min="0.01"
              step="any"
              className="input"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Tipo de pérdida</label>
            <select
              className="input"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS_PERDIDA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Notas (opcional)</label>
          <input
            className="input"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!productos.length}>
          Registrar pérdida
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Pérdidas recientes</h2>
        {perdidas.length === 0 ? (
          <EmptyBlock message="Sin pérdidas registradas." />
        ) : (
          perdidas.map((p) => (
            <div key={p.id} className="card flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {p.cantidad}× {p.producto.nombre}
                </p>
                <p className="text-base text-slate-500">
                  {formatTipoPerdida(p.tipo)} · {formatDate(p.fecha)}
                  {p.notas ? ` · ${p.notas}` : ""}
                </p>
              </div>
              <p className="font-bold text-red-700">
                −{formatMoney(p.costoUnitario * p.cantidad)}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
