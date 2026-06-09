"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { EmptyBlock, LoadingBlock, useToast } from "@/components/ui";
import {
  CATEGORIAS_PRODUCTO,
  UNIDADES,
  formatMoney,
  formatUnidad,
} from "@/lib/utils";

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  precioVenta: number;
  costoCompra: number;
  proveedor: string;
  unidad: string;
  cantidad: number;
  stockMinimo: number;
};

const emptyForm = {
  nombre: "",
  categoria: "CERVEZA",
  precioVenta: "",
  costoCompra: "",
  proveedor: "",
  unidad: "UNIDAD",
  cantidad: "0",
  stockMinimo: "5",
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { show, Toast } = useToast();

  async function load() {
    const res = await fetch("/api/productos");
    setProductos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      precioVenta: Number(form.precioVenta),
      costoCompra: Number(form.costoCompra),
      cantidad: Number(form.cantidad),
      stockMinimo: Number(form.stockMinimo),
    };

    const url = editId ? `/api/productos/${editId}` : "/api/productos";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      show(editId ? "Producto actualizado" : "Producto creado");
      resetForm();
      load();
    } else {
      const err = await res.json();
      show(err.error ?? "Error", "error");
    }
  }

  function startEdit(p: Producto) {
    setEditId(p.id);
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      precioVenta: String(p.precioVenta),
      costoCompra: String(p.costoCompra),
      proveedor: p.proveedor,
      unidad: p.unidad,
      cantidad: String(p.cantidad),
      stockMinimo: String(p.stockMinimo),
    });
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
    if (res.ok) {
      show("Producto eliminado");
      load();
    } else {
      show("No se pudo eliminar", "error");
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Producto[]>();
    for (const p of productos) {
      const list = map.get(p.categoria) ?? [];
      list.push(p);
      map.set(p.categoria, list);
    }
    return map;
  }, [productos]);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      {Toast}
      <header>
        <h1 className="page-title">Productos</h1>
        <p className="page-subtitle">Crear, editar y eliminar productos</p>
      </header>

      <form onSubmit={handleSubmit} className="card grid gap-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-lg font-bold text-slate-900">
          {editId ? "Editar producto" : "Nuevo producto"}
        </h2>

        <Field label="Nombre">
          <input
            className="input"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </Field>

        <Field label="Categoría">
          <select
            className="input"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {CATEGORIAS_PRODUCTO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Precio de venta (COP)">
          <input
            type="number"
            min="0"
            className="input"
            value={form.precioVenta}
            onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
            required
          />
        </Field>

        <Field label="Costo de compra (COP)">
          <input
            type="number"
            min="0"
            className="input"
            value={form.costoCompra}
            onChange={(e) => setForm({ ...form, costoCompra: e.target.value })}
            required
          />
        </Field>

        <Field label="Proveedor">
          <input
            className="input"
            value={form.proveedor}
            onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
          />
        </Field>

        <Field label="Unidad">
          <select
            className="input"
            value={form.unidad}
            onChange={(e) => setForm({ ...form, unidad: e.target.value })}
          >
            {UNIDADES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </Field>

        {!editId && (
          <Field label="Cantidad inicial">
            <input
              type="number"
              min="0"
              className="input"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
          </Field>
        )}

        <Field label="Stock mínimo">
          <input
            type="number"
            min="0"
            className="input"
            value={form.stockMinimo}
            onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
          />
        </Field>

        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="btn btn-primary">
            {editId ? "Guardar" : "Crear producto"}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {productos.length === 0 ? (
        <EmptyBlock message="No hay productos todavía." />
      ) : (
        Array.from(grouped.entries()).map(([cat, items]) => (
          <section key={cat} className="space-y-3">
            <h2 className="text-lg font-bold text-slate-800">{cat}</h2>
            {items.map((p) => (
              <div
                key={p.id}
                className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-slate-900">{p.nombre}</p>
                  <p className="text-base text-slate-500">
                    {formatUnidad(p.unidad)} · {p.proveedor || "Sin proveedor"}
                  </p>
                  <p className="mt-1 text-base">
                    Venta {formatMoney(p.precioVenta)} · Costo {formatMoney(p.costoCompra)} ·
                    Stock {p.cantidad}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="btn btn-secondary">
                    Editar
                  </button>
                  <button onClick={() => remove(p.id)} className="btn btn-danger">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
