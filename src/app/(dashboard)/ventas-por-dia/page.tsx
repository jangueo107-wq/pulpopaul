"use client";

import { useEffect, useState } from "react";
import { LoadingBlock } from "@/components/ui";
import { AnularVentaButton, VentaAnuladaBadge } from "@/components/AnularVenta";
import { cn, formatMoney } from "@/lib/utils";

type DiaResumen = {
  fecha: string;
  fechaParam: string;
  ventasTotales: number;
  gananciaBruta: number;
  numVentas: number;
};

type VentaDetalle = {
  id: string;
  ventaId: string;
  hora: string;
  producto: string;
  cantidad: number;
  precioTotal: number;
  estado: string;
  motivoAnulacion: string | null;
  fechaAnulacion: string | null;
  horaAnulacion: string | null;
};

type DiaDetalle = {
  fecha: string;
  fechaParam: string;
  ventasTotales: number;
  gananciaBruta: number;
  numVentas: number;
  ventas: VentaDetalle[];
};

export default function VentasPorDiaPage() {
  const [dias, setDias] = useState<DiaResumen[]>([]);
  const [detalle, setDetalle] = useState<DiaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  async function loadDias() {
    const res = await fetch("/api/ventas/por-dia");
    const data = await res.json();
    setDias(data.dias ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadDias();
  }, []);

  async function verDia(fechaParam: string) {
    setLoadingDetalle(true);
    const res = await fetch(`/api/ventas/por-dia?fecha=${fechaParam}`);
    setDetalle(await res.json());
    setLoadingDetalle(false);
  }

  async function onAnulada() {
    await loadDias();
    if (detalle) await verDia(detalle.fechaParam);
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Ventas por Día</h1>
        <p className="page-subtitle">Totales diarios (solo ventas activas) — detalle al hacer clic</p>
      </header>

      {detalle && (
        <section className="card space-y-4 border-blue-200 bg-blue-50/30">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{detalle.fecha}</h2>
              <p className="text-sm text-slate-500">{detalle.numVentas} ventas activas</p>
            </div>
            <button type="button" onClick={() => setDetalle(null)} className="btn btn-secondary text-sm">
              Cerrar
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-4">
              <p className="text-sm text-slate-500">Total del día</p>
              <p className="stat-value text-blue-700">{formatMoney(detalle.ventasTotales)}</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-sm text-slate-500">Nº ventas activas</p>
              <p className="stat-value text-slate-900">{detalle.numVentas}</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-sm text-slate-500">Ganancia bruta</p>
              <p className="stat-value text-emerald-700">{formatMoney(detalle.gananciaBruta)}</p>
            </div>
          </div>

          {loadingDetalle ? (
            <LoadingBlock />
          ) : (
            <ul className="space-y-3">
              {(() => {
                const seenAnular = new Set<string>();
                return detalle.ventas.map((v) => {
                  const anulada = v.estado === "ANULADA";
                  const showAnular = !anulada && !seenAnular.has(v.ventaId);
                  if (showAnular) seenAnular.add(v.ventaId);

                  return (
                  <li
                    key={v.id}
                    className={cn(
                      "rounded-xl border bg-white p-4",
                      anulada ? "border-slate-300 bg-slate-50" : "border-slate-200"
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className={cn("font-medium", anulada && "line-through text-slate-500")}>
                          {v.cantidad}× {v.producto}
                        </p>
                        <p className="text-sm text-slate-500">
                          {v.hora} · ID {v.ventaId.slice(0, 8)}…
                        </p>
                        <p className={cn("font-semibold text-blue-700", anulada && "line-through text-slate-400")}>
                          {formatMoney(v.precioTotal)}
                        </p>
                        {anulada && (
                          <VentaAnuladaBadge
                            motivo={v.motivoAnulacion}
                            fechaAnulacion={v.fechaAnulacion}
                            horaAnulacion={v.horaAnulacion}
                          />
                        )}
                      </div>
                      {showAnular && (
                        <AnularVentaButton
                          ventaId={v.ventaId}
                          estado={v.estado}
                          onAnulada={onAnulada}
                          compact
                        />
                      )}
                    </div>
                  </li>
                );
              });
              })()}
            </ul>
          )}
        </section>
      )}

      <section className="space-y-2">
        {dias.length === 0 ? (
          <div className="card text-center text-slate-500">Aún no hay ventas registradas.</div>
        ) : (
          dias.map((d) => (
            <button
              key={d.fechaParam}
              type="button"
              onClick={() => verDia(d.fechaParam)}
              className={cn(
                "card flex w-full flex-wrap items-center justify-between gap-3 text-left transition hover:border-blue-300 hover:shadow-md",
                detalle?.fechaParam === d.fechaParam && "border-blue-400 ring-2 ring-blue-100"
              )}
            >
              <div>
                <p className="text-lg font-bold text-slate-900">{d.fecha}</p>
                <p className="text-sm text-slate-500">{d.numVentas} ventas activas</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-700">{formatMoney(d.ventasTotales)}</p>
                <p className="text-sm text-emerald-700">+{formatMoney(d.gananciaBruta)}</p>
              </div>
            </button>
          ))
        )}
      </section>
    </div>
  );
}
