"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn, formatUnidad } from "@/lib/utils";

type Producto = {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
};

type Props = {
  producto: Producto;
  onClose: () => void;
  onSaved: () => void;
};

export function EditarStockModal({ producto, onClose, onSaved }: Props) {
  const [modo, setModo] = useState<"exacta" | "delta">("exacta");
  const [cantidadNueva, setCantidadNueva] = useState(String(producto.cantidad));
  const [delta, setDelta] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const previewExacta = Number(cantidadNueva);
  const previewDelta =
    delta === "" || delta === "-" ? producto.cantidad : producto.cantidad + Number(delta);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload =
      modo === "exacta"
        ? {
            productoId: producto.id,
            modo: "exacta" as const,
            cantidadNueva: Number(cantidadNueva),
            motivo,
          }
        : {
            productoId: producto.id,
            modo: "delta" as const,
            delta: Number(delta),
            motivo,
          };

    const res = await fetch("/api/inventario/ajustar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const err = await res.json();
      setError(err.error ?? "No se pudo guardar");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-labelledby="editar-stock-title"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="editar-stock-title" className="text-lg font-bold text-slate-900">
              Editar stock
            </h2>
            <p className="text-sm text-slate-500">{producto.nombre}</p>
            <p className="mt-1 text-sm">
              Stock actual:{" "}
              <span className="font-bold text-slate-900">
                {producto.cantidad} {formatUnidad(producto.unidad).toLowerCase()}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModo("exacta")}
              className={cn(
                "btn flex-1 py-2 text-sm",
                modo === "exacta" ? "btn-primary" : "btn-secondary"
              )}
            >
              Cantidad exacta
            </button>
            <button
              type="button"
              onClick={() => setModo("delta")}
              className={cn(
                "btn flex-1 py-2 text-sm",
                modo === "delta" ? "btn-primary" : "btn-secondary"
              )}
            >
              Ajuste + / −
            </button>
          </div>

          {modo === "exacta" ? (
            <div>
              <label className="label">Nueva cantidad exacta</label>
              <input
                type="number"
                min="0"
                step="any"
                className="input"
                value={cantidadNueva}
                onChange={(e) => setCantidadNueva(e.target.value)}
                required
              />
              <p className="mt-2 text-sm text-slate-500">
                Diferencia:{" "}
                <span className="font-semibold">
                  {!Number.isNaN(previewExacta)
                    ? (previewExacta - producto.cantidad >= 0 ? "+" : "") +
                      (previewExacta - producto.cantidad)
                    : "—"}
                </span>
              </p>
            </div>
          ) : (
            <div>
              <label className="label">Ajuste (+ suma, − resta)</label>
              <input
                type="number"
                step="any"
                className="input"
                placeholder="Ej: 10 o -5"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                required
              />
              <p className="mt-2 text-sm text-slate-500">
                Stock resultante:{" "}
                <span className="font-semibold">
                  {Number.isNaN(previewDelta) ? "—" : previewDelta}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="label">Motivo (opcional)</label>
            <input
              className="input"
              placeholder="Ej: conteo físico, corrección manual"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? "Guardando..." : "Guardar ajuste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
