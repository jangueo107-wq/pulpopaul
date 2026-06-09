"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ListOrdered,
  CalendarDays,
  Package,
  Warehouse,
  History,
  Truck,
  Receipt,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/estadisticas", label: "Estadísticas", icon: ListOrdered },
  { href: "/ventas-por-dia", label: "Ventas por Día", icon: CalendarDays },
  { href: "/inventario", label: "Inventario", icon: Warehouse },
  { href: "/ajustes-inventario", label: "Ajustes", icon: History },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/compras", label: "Compras", icon: Truck },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/perdidas", label: "Pérdidas", icon: AlertTriangle },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = links.find((l) => l.href === pathname);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-purple-900/10 bg-brand-dark lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Logo size="md" variant="dark" />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-accent/20 text-white"
                    : "text-purple-200 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-purple-200 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="brand-header sticky top-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur lg:hidden">
          <Logo size="sm" variant="dark" showText />
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-200">{current?.label}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            >
              Salir
            </button>
          </div>
        </header>

        <header className="sticky top-0 z-10 hidden border-b border-slate-200 bg-white/95 px-8 py-4 backdrop-blur lg:block">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Logo size="sm" variant="light" />
            <p className="text-sm font-medium text-slate-500">{current?.label ?? "Panel"}</p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-5 pb-24 md:px-6 md:py-6 lg:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className="flex overflow-x-auto px-0.5 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-[3.5rem] shrink-0 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[9px] font-medium",
                  active ? "text-brand-accent" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                <span className="max-w-[4rem] truncate text-center">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
