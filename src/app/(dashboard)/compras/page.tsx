"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyBlock, LoadingBlock, useToast } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/utils";

type Producto = { id: string; nombre: string; costoCompra: number };

type CompraItem = {
  id: string;
  cantidad: number;
  costoUnitario: number;
  producto: { nombre: string };
};

type Compra = {
  id: string;
  fecha: string;
  proveedor: string | null;
  notas: string | null;
  items: CompraItem[];
};

type LineItem = { productoId: string; cantidad: number; costoUnitario: string };

export default function ComprasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedor, setProveedor] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { productoId: "", cantidad: 1, costoUnitario: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const { show, Toast } = useToast();

  async function load() {
    const [prodRes, comprasRes] = await Promise.all([
      fetch("/api/productos"),
      fetch("/api/compras"),
    ]);
    setProductos(await prodRes.json());
    setCompras(await comprasRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function onProductChange(index: number, productoId: string) {
    const producto = productos.find((p) => p.id === productoId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, productoId, costoUnitario: producto ? String(producto.costoCompra) : "" }
          : item
      )
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validItems = items
      .filter((i) => i.productoId && i.cantidad > 0)
      .map((i) => ({
        productoId: i.productoId,
        cantidad: i.cantidad,
        costoUnitario: i.costoUnitario ? Number(i.costoUnitario) : undefined,
      }));

    if (!validItems.length) {
      show("Agrega al menos un producto", "error");
      return;
    }

    const res = await fetch("/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proveedor, notas, items: validItems }),
    });

    if (res.ok) {
      show("Compra registrada");
      setProveedor("");
      setNotas("");
      setItems([{ productoId: "", cantidad: 1, costoUnitario: "" }]);
      load();
    } else {
      show("Error al registrar", "error");
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      {Toast}
      <header>
        <h1 className="page-title">Compras</h1>
        <p className="page-subtitle">Reabastecimiento — fecha automática al guardar</p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Proveedor</label>
            <input
              className="input"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor"
            />
          </div>
          <div>
            <label className="label">Notas</label>
            <input
              className="input"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="label mb-0">Productos comprados</p>
          {items.map((item, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_100px_130px]">
              <select
                className="input"
                value={item.productoId}
                onChange={(e) => onProductChange(index, e.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.01"
                step="any"
                className="input"
                placeholder="Cant."
                value={item.cantidad}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((it, i) =>
                      i === index ? { ...it, cantidad: Number(e.target.value) } : it
                    )
                  )
                }
              />
              <input
                type="number"
                min="0"
                className="input"
                placeholder="Costo unit."
                value={item.costoUnitario}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((it, i) =>
                      i === index ? { ...it, costoUnitario: e.target.value } : it
                    )
                  )
                }
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setItems((prev) => [...prev, { productoId: "", cantidad: 1, costoUnitario: "" }])
          }
        >
          + Agregar producto
        </button>

        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Guardar compra
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Compras recientes</h2>
        {compras.length === 0 ? (
          <EmptyBlock message="Sin compras registradas." />
        ) : (
          compras.map((c) => {
            const total = c.items.reduce((s, i) => s + i.costoUnitario * i.cantidad, 0);
            return (
              <div key={c.id} className="card">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{formatDate(c.fecha)}</p>
                    <p className="text-base text-slate-500">
                      {c.proveedor || "Sin proveedor"}
                      {c.notas ? ` · ${c.notas}` : ""}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{formatMoney(total)}</p>
                </div>
                <ul className="mt-3 space-y-1 text-base text-slate-600">
                  {c.items.map((i) => (
                    <li key={i.id}>
                      {i.cantidad}× {i.producto.nombre} @ {formatMoney(i.costoUnitario)}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
