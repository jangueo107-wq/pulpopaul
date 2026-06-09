"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/ui";
import { AnularVentaButton, VentaAnuladaBadge } from "@/components/AnularVenta";
import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

type VentaDetalle = {
  id: string;
  ventaId: string;
  fecha: string;
  hora: string;
  producto: string;
  cantidad: number;
  precioTotal: number;
  estado: string;
  motivoAnulacion: string | null;
  fechaAnulacion: string | null;
  horaAnulacion: string | null;
};

type ResumenDia = {
  fecha: string;
  ventasTotales: number;
  gananciaBruta: number;
  numVentas: number;
};

export default function EstadisticasPage() {
  const [ventas, setVentas] = useState<VentaDetalle[]>([]);
  const [resumenPorDia, setResumenPorDia] = useState<Record<string, ResumenDia>>({});
  const [modo, setModo] = useState<"todo" | "dia" | "rango">("todo");
  const [fecha, setFecha] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (modo === "dia" && fecha) params.set("fecha", fecha);
    if (modo === "rango") {
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
    }

    const res = await fetch(`/api/ventas/detalle?${params}`);
    const data = await res.json();
    setVentas(data.ventas);
    setResumenPorDia(data.resumenPorDia ?? {});
    setLoading(false);
  }, [modo, fecha, desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);


  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Estadísticas</h1>
        <p className="page-subtitle">
          Todas las ventas — las anuladas no cuentan en totales pero siguen visibles
        </p>
      </header>

      <section className="card space-y-4">
        <h2 className="font-bold text-slate-900">Filtrar ventas</h2>
        <div className="flex flex-wrap gap-2">
          {(["todo", "dia", "rango"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={`btn ${modo === m ? "btn-primary" : "btn-secondary"} px-3 py-2 text-sm`}
            >
              {m === "todo" ? "Todas" : m === "dia" ? "Por día" : "Rango"}
            </button>
          ))}
        </div>

        {modo === "dia" && (
          <input
            type="date"
            className="input max-w-xs"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        )}

        {modo === "rango" && (
          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              className="input max-w-xs"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
            <input
              type="date"
              className="input max-w-xs"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        )}

        {(modo === "dia" || modo === "rango") && (
          <button type="button" onClick={load} className="btn btn-primary">
            Aplicar filtro
          </button>
        )}
      </section>

      {Object.keys(resumenPorDia).length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-slate-900">Resumen por día (solo ventas activas)</h2>
          {Object.entries(resumenPorDia)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, r]) => (
              <div key={key} className="card grid gap-2 sm:grid-cols-4">
                <p className="font-semibold text-slate-900">{r.fecha}</p>
                <p className="text-sm text-slate-600">
                  Ventas: <span className="font-medium text-blue-700">{formatMoney(r.ventasTotales)}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Nº ventas: <span className="font-medium">{r.numVentas}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Ganancia: <span className="font-medium text-emerald-700">{formatMoney(r.gananciaBruta)}</span>
                </p>
              </div>
            ))}
        </section>
      )}

      {loading ? (
        <LoadingBlock />
      ) : ventas.length === 0 ? (
        <div className="card text-center text-slate-500">No hay ventas para mostrar.</div>
      ) : (
        <div className="space-y-3">
          {(() => {
            const seenAnular = new Set<string>();
            return ventas.map((v) => {
              const anulada = v.estado === "ANULADA";
              const showAnular = !anulada && !seenAnular.has(v.ventaId);
              if (showAnular) seenAnular.add(v.ventaId);

              return (
              <div
                key={v.id}
                className={cn(
                  "card",
                  anulada && "border-slate-300 bg-slate-50 opacity-90"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">ID: {v.ventaId.slice(0, 10)}…</span>
                      {anulada && (
                        <span className="badge badge-danger font-bold">ANULADA</span>
                      )}
                    </div>
                    <p className={cn("mt-1 text-lg font-semibold", anulada && "line-through text-slate-500")}>
                      {v.cantidad}× {v.producto}
                    </p>
                    <p className="text-sm text-slate-500">
                      {v.fecha} · {v.hora}
                    </p>
                    <p className={cn("mt-1 font-bold text-blue-700", anulada && "line-through text-slate-400")}>
                      {formatMoney(v.precioTotal)}
                    </p>
                    {anulada && (
                      <div className="mt-2">
                        <VentaAnuladaBadge
                          motivo={v.motivoAnulacion}
                          fechaAnulacion={v.fechaAnulacion}
                          horaAnulacion={v.horaAnulacion}
                        />
                      </div>
                    )}
                  </div>
                  {showAnular && (
                    <AnularVentaButton ventaId={v.ventaId} estado={v.estado} onAnulada={load} />
                  )}
                </div>
              </div>
            );
          });
          })()}
        </div>
      )}
    </div>
  );
}
