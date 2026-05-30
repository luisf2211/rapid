"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Package,
  Boxes,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/quotations", label: "Cotiz.", icon: FileText },
  { href: "/work-orders", label: "Órdenes", icon: ClipboardList },
  { href: "/inventory", label: "Stock", icon: Package, showStockBadge: true },
  { href: "/material-requisitions", label: "Req.", icon: Boxes },
] as const;

export function MobileBottomNav({
  stockAlertCount = 0,
}: {
  stockAlertCount?: number;
}) {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-rapid-border flex">
      {items.map((it) => {
        const Icon = it.icon;
        const active =
          pathname === it.href ||
          (it.href !== "/dashboard" && pathname.startsWith(it.href));
        const badge =
          "showStockBadge" in it && it.showStockBadge && stockAlertCount > 0;

        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium gap-0.5",
              active
                ? "text-rapid-text font-semibold"
                : "text-rapid-text-muted hover:text-rapid-text",
            )}
          >
            <span className="relative">
              <Icon className="w-4.5 h-4.5" />
              {badge && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-500 text-[8px] font-bold text-amber-950 flex items-center justify-center">
                  {stockAlertCount > 9 ? "9+" : stockAlertCount}
                </span>
              )}
            </span>
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
