"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  ventaId: string;
  estado: string;
  onAnulada: () => void;
  compact?: boolean;
};

export function AnularVentaButton({ ventaId, estado, onAnulada, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("Vendido por error");
  const [loading, setLoading] = useState(false);

  if (estado === "ANULADA") return null;

  async function confirmar() {
    setLoading(true);
    const res = await fetch(`/api/ventas/${ventaId}/anular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      onAnulada();
    } else {
      const err = await res.json();
      alert(err.error ?? "No se pudo anular");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-lg border border-red-200 bg-red-50 font-medium text-red-700 hover:bg-red-100",
          compact ? "px-2 py-1 text-xs" : "btn px-3 py-1.5 text-sm"
        )}
      >
        Anular venta
      </button>
    );
  }

  return (
    <div className={cn("space-y-2", compact ? "min-w-[180px]" : "")}>
      <input
        className="input py-2 text-sm"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo de anulación"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={confirmar}
          className="btn btn-danger flex-1 py-2 text-sm"
        >
          {loading ? "..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-secondary py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function VentaAnuladaBadge({
  motivo,
  fechaAnulacion,
  horaAnulacion,
}: {
  motivo: string | null;
  fechaAnulacion: string | null;
  horaAnulacion: string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600">
      <span className="font-bold text-red-600">ANULADA</span>
      {motivo && <span> — {motivo}</span>}
      {fechaAnulacion && (
        <span className="block text-xs text-slate-500">
          Anulada: {fechaAnulacion} {horaAnulacion}
        </span>
      )}
    </div>
  );
}
