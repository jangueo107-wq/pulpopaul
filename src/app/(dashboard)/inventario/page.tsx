"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ClipboardList, PackagePlus, Pencil, History } from "lucide-react";
import { EditarStockModal } from "@/components/EditarStockModal";
import { EmptyBlock, LoadingBlock, useToast } from "@/components/ui";
import {
  CATEGORIAS_FILTRO,
  getCategoriaStyle,
  getStockBg,
  getStockColor,
} from "@/lib/categories";
import { cn, formatMoney, formatUnidad } from "@/lib/utils";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  stockMinimo: number;
  unidad: string;
  precioVenta: number;
  costoCompra: number;
};

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState<string | null>(null);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const { show, Toast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/inventario");
    const data = await res.json();
    setProductos(data.productos);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const matchQ =
        !q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
      const matchCat = categoria === "Todas" || p.categoria === categoria;
      return matchQ && matchCat;
    });
  }, [productos, busqueda, categoria]);

  const sinStock = productos.filter((p) => p.cantidad === 0);
  const bajoMinimo = productos.filter((p) => p.cantidad > 0 && p.cantidad <= p.stockMinimo);

  function generarListaReposicion() {
    const lista = productos.filter((p) => p.cantidad <= p.stockMinimo);
    if (!lista.length) {
      show("No hay productos por reponer", "error");
      return;
    }
    const texto = lista
      .map(
        (p) =>
          `• ${p.nombre} (${p.categoria}) — actual: ${p.cantidad} ${formatUnidad(p.unidad).toLowerCase()}, mínimo: ${p.stockMinimo}`
      )
      .join("\n");
    navigator.clipboard?.writeText(`Lista de reposición — Jangueo\n\n${texto}`);
    show(`Lista copiada (${lista.length} productos)`);
  }

  async function cargarStock(producto: Producto) {
    const raw = cantidades[producto.id] ?? "1";
    const cantidad = Number(raw);
    if (!cantidad || cantidad <= 0) {
      show("Cantidad inválida", "error");
      return;
    }

    setCargando(producto.id);
    const res = await fetch("/api/inventario/cargar-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: producto.id, cantidad }),
    });

    if (res.ok) {
      show(`Se agregaron ${cantidad} unidades a ${producto.nombre}`);
      setCantidades((prev) => ({ ...prev, [producto.id]: "1" }));
      load();
    } else {
      const err = await res.json();
      show(err.error ?? "Error al cargar stock", "error");
    }
    setCargando(null);
  }

  function onAjusteGuardado() {
    show("Stock actualizado y registrado en auditoría");
    load();
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      {Toast}
      {editando && (
        <EditarStockModal
          producto={editando}
          onClose={() => setEditando(null)}
          onSaved={onAjusteGuardado}
        />
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">Stock, recarga rápida y edición manual</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/ajustes-inventario" className="btn btn-secondary">
            <History className="h-4 w-4" />
            Historial de ajustes
          </Link>
          <button type="button" onClick={generarListaReposicion} className="btn btn-secondary">
            <ClipboardList className="h-4 w-4" />
            Lista reposición
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card border-slate-200">
          <p className="text-sm font-medium text-slate-600">Total productos</p>
          <p className="stat-value text-slate-900">{productos.length}</p>
        </div>
        <div className="card border-amber-200 bg-amber-50/40">
          <p className="text-sm font-medium text-slate-600">Stock bajo</p>
          <p className="stat-value text-amber-700">{bajoMinimo.length}</p>
        </div>
        <div className="card border-red-200 bg-red-50/40">
          <p className="text-sm font-medium text-slate-600">Sin stock</p>
          <p className="stat-value text-red-700">{sinStock.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-12"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className="input sm:max-w-[200px]"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {CATEGORIAS_FILTRO.map((c) => (
            <option key={c} value={c}>
              {c === "Todas" ? "Todas las categorías" : c}
            </option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyBlock message="No se encontraron productos." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((p) => {
            const style = getCategoriaStyle(p.categoria);
            const stockBoxClass = getStockBg(p.cantidad, p.stockMinimo);
            const stockTextClass = getStockColor(p.cantidad, p.stockMinimo);
            const estadoLabel =
              p.cantidad === 0 ? "Sin stock" : p.cantidad <= p.stockMinimo ? "Stock bajo" : "OK";

            return (
              <article
                key={p.id}
                className={cn(
                  "card flex flex-col gap-4 border-2 transition",
                  p.cantidad === 0 && "border-red-300",
                  p.cantidad > 0 && p.cantidad <= p.stockMinimo && "border-amber-300"
                )}
              >
                <div>
                  <span className={cn("badge border text-xs font-semibold", style.badge)}>
                    {style.emoji} {p.categoria}
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{p.nombre}</h2>
                </div>

                <div className={cn("rounded-xl border-2 p-4", stockBoxClass)}>
                  <p className="text-sm font-medium text-slate-600">Stock actual</p>
                  <p className={cn("text-4xl font-bold tracking-tight", stockTextClass)}>
                    {p.cantidad}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Mínimo: {p.stockMinimo} · {formatUnidad(p.unidad)}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-block badge",
                      p.cantidad === 0
                        ? "badge-danger"
                        : p.cantidad <= p.stockMinimo
                          ? "badge-warning"
                          : "badge-ok"
                    )}
                  >
                    {estadoLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Precio venta</p>
                    <p className="font-semibold text-slate-900">{formatMoney(p.precioVenta)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Costo compra</p>
                    <p className="font-semibold text-slate-900">{formatMoney(p.costoCompra)}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-sm">
                  <p className="text-slate-500">Margen por unidad</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {formatMoney(p.precioVenta - p.costoCompra)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditando(p)}
                  className="btn btn-secondary w-full"
                >
                  <Pencil className="h-4 w-4" />
                  Editar stock
                </button>

                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    className="input w-24 py-2 text-center font-semibold"
                    value={cantidades[p.id] ?? "1"}
                    onChange={(e) =>
                      setCantidades((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    disabled={cargando === p.id}
                    onClick={() => cargarStock(p)}
                    className="btn btn-primary flex-1"
                  >
                    <PackagePlus className="h-4 w-4" />
                    {cargando === p.id ? "..." : "Cargar stock"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
