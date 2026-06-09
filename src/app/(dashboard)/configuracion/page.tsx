"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingBlock, useToast } from "@/components/ui";

export default function ConfiguracionPage() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const { show, Toast } = useToast();

  useEffect(() => {
    fetch("/api/auth/perfil")
      .then((r) => r.json())
      .then((data) => {
        setUsername(data.username ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      show("Las contraseñas nuevas no coinciden", "error");
      return;
    }

    const res = await fetch("/api/auth/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      show("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const err = await res.json();
      show(err.error ?? "Error al cambiar contraseña", "error");
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {Toast}
      <header>
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">Perfil y seguridad de la cuenta</p>
      </header>

      <section className="card">
        <h2 className="text-lg font-bold text-slate-900">Tu cuenta</h2>
        <p className="mt-2 text-base text-slate-600">
          Usuario: <span className="font-semibold text-slate-900">{username}</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          La contraseña se valida con bcrypt en el servidor. Nunca se almacena en texto plano.
        </p>
      </section>

      <section className="card border-amber-100 bg-amber-50/50">
        <h2 className="text-lg font-bold text-slate-900">Clave de recuperación</h2>
        <p className="mt-2 text-sm text-slate-600">
          Existe una clave de recuperación interna fija para emergencias. Permite iniciar sesión si
          olvidas la contraseña principal, pero no se muestra ni puede editarse desde esta pantalla.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Cambiar contraseña principal</h2>
        <p className="text-sm text-slate-500">
          Solo puedes modificar la contraseña principal. La clave de recuperación permanece fija en
          el servidor.
        </p>

        <div>
          <label className="label" htmlFor="current">
            Contraseña actual
          </label>
          <input
            id="current"
            type="password"
            className="input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="new">
            Nueva contraseña
          </label>
          <input
            id="new"
            type="password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="confirm">
            Confirmar nueva contraseña
          </label>
          <input
            id="confirm"
            type="password"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Guardar nueva contraseña
        </button>
      </form>
    </div>
  );
}
