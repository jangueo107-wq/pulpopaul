"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-dark via-purple-950 to-brand-dark">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo
              size="lg"
              variant="dark"
              showText
              className="flex-col items-center gap-4 text-center [&>div:last-child]:text-center"
            />
            <p className="mt-4 text-sm text-purple-300">Acceso privado al panel</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="space-y-5">
              <div>
                <label className="label" htmlFor="username">
                  Usuario
                </label>
                <input
                  id="username"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-700">{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary w-full text-lg">
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
