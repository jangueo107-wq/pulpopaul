"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoadingBlock } from "@/components/ui";
import { cn } from "@/lib/utils";

type Ajuste = {
  id: string;
  productoId: string;
  producto: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  diferencia: number;
  motivo: string | null;
  usuario: string | null;
  fecha: string;
  hora: string;
};

type Producto = { id: string; nombre: string };

export default function AjustesInventarioPage() {
  const [ajustes, setAjustes] = useState<Ajuste[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoId, setProductoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [modoFecha, setModoFecha] = useState<"todo" | "dia" | "rango">("todo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => r.json())
      .then(setProductos);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (productoId) params.set("productoId", productoId);
    if (modoFecha === "dia" && fecha) params.set("fecha", fecha);
    if (modoFecha === "rango") {
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
    }

    const res = await fetch(`/api/inventario/ajustes?${params}`);
    const data = await res.json();
    setAjustes(data.ajustes ?? []);
    setLoading(false);
  }, [productoId, modoFecha, fecha, desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/inventario"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a inventario
          </Link>
          <h1 className="page-title">Historial de ajustes</h1>
          <p className="page-subtitle">Auditoría de ediciones manuales de inventario</p>
        </div>
      </header>

      <section className="card space-y-4">
        <h2 className="font-bold text-slate-900">Filtros</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Producto</label>
            <select
              className="input"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
            >
              <option value="">Todos los productos</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha</label>
            <div className="flex flex-wrap gap-2">
              {(["todo", "dia", "rango"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModoFecha(m)}
                  className={cn(
                    "btn px-3 py-1.5 text-sm",
                    modoFecha === m ? "btn-primary" : "btn-secondary"
                  )}
                >
                  {m === "todo" ? "Todas" : m === "dia" ? "Día" : "Rango"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {modoFecha === "dia" && (
          <input type="date" className="input max-w-xs" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        )}
        {modoFecha === "rango" && (
          <div className="flex flex-wrap gap-3">
            <input type="date" className="input max-w-xs" value={desde} onChange={(e) => setDesde(e.target.value)} />
            <input type="date" className="input max-w-xs" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        )}

        {(modoFecha !== "todo" || productoId) && (
          <button type="button" onClick={load} className="btn btn-primary">
            Aplicar filtros
          </button>
        )}
      </section>

      {loading ? (
        <LoadingBlock />
      ) : ajustes.length === 0 ? (
        <div className="card text-center text-slate-500">No hay ajustes registrados.</div>
      ) : (
        <div className="space-y-3">
          {ajustes.map((a) => (
            <article key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{a.producto}</p>
                  <p className="text-sm text-slate-500">
                    {a.fecha} · {a.hora}
                    {a.usuario ? ` · ${a.usuario}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "badge text-sm font-bold",
                    a.diferencia > 0 ? "badge-ok" : "badge-danger"
                  )}
                >
                  {a.diferencia > 0 ? "+" : ""}
                  {a.diferencia}
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Stock antes</p>
                  <p className="font-bold text-slate-900">{a.cantidadAnterior}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Stock después</p>
                  <p className="font-bold text-slate-900">{a.cantidadNueva}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-slate-500">Cambio</p>
                  <p
                    className={cn(
                      "font-bold",
                      a.diferencia > 0 ? "text-emerald-700" : "text-red-700"
                    )}
                  >
                    {a.diferencia > 0 ? "+" : ""}
                    {a.diferencia}
                  </p>
                </div>
              </div>

              {a.motivo && (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-medium">Motivo:</span> {a.motivo}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
