"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIAS, CATEGORIAS_VENTA, getCategoriaStyle } from "@/lib/categories";
import { cn, formatDateCO, formatMoney, formatTimeCO } from "@/lib/utils";
import { LoadingBlock, useToast } from "@/components/ui";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  precioVenta: number;
  cantidad: number;
};

type VentaReciente = {
  id: string;
  fecha: string;
  items: { cantidad: number; precioUnitario: number; producto: { nombre: string } }[];
};

type Resumen = {
  stats: {
    ventasTotales: number;
    gananciaBruta: number;
    numVentas: number;
  };
  ventas: VentaReciente[];
};

const VENTA_CATEGORIAS = CATEGORIAS_VENTA;

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [vendiendo, setVendiendo] = useState<string | null>(null);
  const { show, Toast } = useToast();

  const load = useCallback(async () => {
    const [prodRes, resumenRes] = await Promise.all([
      fetch("/api/productos"),
      fetch("/api/ventas/resumen"),
    ]);
    const prods: Producto[] = await prodRes.json();
    const res: Resumen = await resumenRes.json();
    setProductos(prods.filter((p) => VENTA_CATEGORIAS.includes(p.categoria)));
    setResumen(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const porCategoria = useMemo(() => {
    const map = new Map<string, Producto[]>();
    for (const cat of VENTA_CATEGORIAS) map.set(cat, []);
    for (const p of productos) {
      const list = map.get(p.categoria) ?? [];
      list.push(p);
      map.set(p.categoria, list);
    }
    return map;
  }, [productos]);

  function getCantidad(id: string) {
    return cantidades[id] ?? 1;
  }

  function setCantidad(id: string, val: number) {
    setCantidades((prev) => ({ ...prev, [id]: Math.max(0.01, val) }));
  }

  async function vender(producto: Producto) {
    const cantidad = getCantidad(producto.id);
    if (cantidad <= 0) {
      show("Cantidad inválida", "error");
      return;
    }

    setVendiendo(producto.id);
    const res = await fetch("/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productoId: producto.id, cantidad }] }),
    });

    if (res.ok) {
      show(`✓ ${producto.nombre} × ${cantidad}`);
      setCantidad(producto.id, 1);
      load();
    } else {
      const err = await res.json();
      show(err.error ?? "Error al vender", "error");
    }
    setVendiendo(null);
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      {Toast}
      <header>
        <h1 className="page-title">Ventas</h1>
        <p className="page-subtitle">Toca un producto para registrar la venta al instante</p>
      </header>

      {resumen && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card border-blue-100 bg-blue-50/40">
            <p className="text-sm font-medium text-slate-600">Ventas del día</p>
            <p className="stat-value text-brand-purple">{formatMoney(resumen.stats.ventasTotales)}</p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600">Nº ventas hoy</p>
            <p className="stat-value text-slate-900">{resumen.stats.numVentas}</p>
          </div>
          <div className="card border-emerald-100 bg-emerald-50/40">
            <p className="text-sm font-medium text-slate-600">Utilidad del día</p>
            <p className="stat-value text-emerald-700">{formatMoney(resumen.stats.gananciaBruta)}</p>
          </div>
        </div>
      )}

      {CATEGORIAS.filter((c) => VENTA_CATEGORIAS.includes(c.value)).map((cat) => {
        const items = porCategoria.get(cat.value) ?? [];
        if (!items.length) return null;
        const style = getCategoriaStyle(cat.value);

        return (
          <section key={cat.value}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
              <span>{style.emoji}</span> {cat.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <div
                  key={p.id}
                  className={cn("rounded-2xl border p-3", style.bg, style.border)}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-slate-600">Cantidad</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      className="input w-24 py-2 text-center text-lg font-semibold"
                      value={getCantidad(p.id)}
                      onChange={(e) => setCantidad(p.id, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={vendiendo === p.id || p.cantidad <= 0}
                    onClick={() => vender(p)}
                    className={cn(
                      "w-full rounded-xl border-2 px-4 py-5 text-left transition active:scale-[0.98] disabled:opacity-50",
                      style.border,
                      "bg-white hover:shadow-md"
                    )}
                  >
                    <p className={cn("text-lg font-bold leading-tight", style.text)}>
                      {p.nombre}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-700">
                      {formatMoney(p.precioVenta)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Stock: {p.cantidad}</p>
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {resumen && resumen.ventas.length > 0 && (
        <section className="card">
          <h2 className="text-lg font-bold text-slate-900">Últimas ventas de hoy</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {resumen.ventas.map((v) => {
              const total = v.items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
              const nombres = v.items
                .map((i) => `${i.cantidad}× ${i.producto.nombre}`)
                .join(", ");
              return (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{nombres}</p>
                    <p className="text-sm text-slate-500">
                      {formatDateCO(v.fecha)} · {formatTimeCO(v.fecha)}
                    </p>
                  </div>
                  <p className="font-semibold text-blue-700">{formatMoney(total)}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
