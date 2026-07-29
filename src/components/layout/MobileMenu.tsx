"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarNavGroups, isNavActive } from "./nav-config";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white transition"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" strokeWidth={2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <nav className="absolute top-0 left-0 bottom-0 w-72 bg-[#0c100f] text-white overflow-y-auto overscroll-contain shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
              <span className="font-bold text-base">Menú</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white transition"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 py-4 space-y-5">
              {sidebarNavGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                    {group.label}
                  </p>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                              active
                                ? "bg-rapid-green/15 text-white shadow-[inset_0_0_0_1px_rgba(0,200,83,0.25)]"
                                : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
                            )}
                          >
                            <span
                              className={cn(
                                "flex shrink-0 items-center justify-center rounded-lg h-8 w-8 transition-colors",
                                active
                                  ? "bg-rapid-green text-rapid-black"
                                  : "bg-white/[0.06] text-white/50",
                              )}
                            >
                              <Icon className="h-4 w-4" strokeWidth={2.25} />
                            </span>
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
