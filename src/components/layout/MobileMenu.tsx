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
        className="flex h-8 w-8 items-center justify-center rounded-lg text-rapid-text-muted hover:bg-rapid-surface-strong hover:text-rapid-text transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <nav className="absolute top-0 left-0 bottom-0 w-[280px] bg-white overflow-y-auto overscroll-contain shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-rapid-border">
              <span className="font-semibold text-sm text-rapid-text">Menú</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-rapid-text-muted hover:bg-rapid-surface-strong hover:text-rapid-text transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-3 py-3 space-y-4">
              {sidebarNavGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-2 mb-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-rapid-text-muted-soft">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150",
                              active
                                ? "bg-rapid-green-soft text-rapid-green-dark"
                                : "text-rapid-text-muted hover:bg-rapid-surface-strong hover:text-rapid-text",
                            )}
                          >
                            <Icon
                              className="h-4 w-4 shrink-0"
                              strokeWidth={active ? 2.25 : 1.75}
                            />
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
