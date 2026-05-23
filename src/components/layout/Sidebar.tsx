"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Wrench,
  Plus,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/work-orders", label: "Órdenes de recepción", icon: ClipboardList },
  {
    href: "/material-requisitions",
    label: "Requisición de materiales",
    icon: Boxes,
  },
  { href: "/labor-orders", label: "Mano de obra", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-rapid-black text-white">
      <div className="px-5 py-5 border-b border-white/5">
        <Logo variant="dark" />
      </div>

      <div className="px-4 pt-5">
        <Link
          href="/work-orders/new"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-rapid-green text-rapid-black font-semibold text-sm hover:bg-[#00e25f] transition shadow-[0_0_24px_rgba(0,200,83,0.25)]"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nueva orden
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold">
          Operaciones
        </p>
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-rapid-green" : "text-white/50",
                )}
                strokeWidth={2}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rapid-green" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-4 mb-5 rounded-xl bg-gradient-to-br from-rapid-green/15 to-transparent border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="dot-live" />
          <span className="text-xs font-medium text-white/80">
            Sistema operativo
          </span>
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed">
          MVP del taller en tiempo real. Datos sincronizados con SQL Server.
        </p>
      </div>
    </aside>
  );
}
