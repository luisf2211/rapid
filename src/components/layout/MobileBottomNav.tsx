"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Package,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive } from "./nav-config";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/quotations", label: "Cotiz.", icon: FileText },
  { href: "/work-orders", label: "Órdenes", icon: ClipboardList },
  { href: "/invoices", label: "Facturar", icon: Receipt },
  { href: "/inventory", label: "Stock", icon: Package, showStockBadge: true },
] as const;

export function MobileBottomNav({
  stockAlertCount = 0,
}: {
  stockAlertCount?: number;
}) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-3 pb-3 pt-0 pointer-events-none">
      <div className="pointer-events-auto flex items-stretch justify-around gap-1 rounded-2xl border border-rapid-border/80 bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-1 py-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = isNavActive(pathname, it.href);
          const badge =
            "showStockBadge" in it && it.showStockBadge && stockAlertCount > 0;

          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 min-w-0 transition-colors",
                active ? "text-rapid-green-dark" : "text-rapid-text-muted",
              )}
            >
              {active && (
                <span
                  className="absolute inset-x-2 top-1 bottom-1 rounded-lg bg-rapid-green-soft -z-10"
                  aria-hidden
                />
              )}
              <span className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5",
                    active && "stroke-[2.5]",
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {badge && (
                  <span className="absolute -top-0.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-500 text-[8px] font-bold text-amber-950 flex items-center justify-center ring-2 ring-white">
                    {stockAlertCount > 9 ? "9+" : stockAlertCount}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium truncate max-w-full px-0.5",
                  active && "font-semibold",
                )}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
