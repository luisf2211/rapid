"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Boxes,
  Wrench,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quotations", label: "Cotizaciones", icon: FileText },
  { href: "/work-orders", label: "Órdenes de recepción", icon: ClipboardList },
  {
    href: "/material-requisitions",
    label: "Requisición de materiales",
    icon: Boxes,
  },
  { href: "/labor-orders", label: "Mano de obra", icon: Wrench },
  { href: "/inventory", label: "Inventario", icon: Package, stockAlerts: true },
] as const;

export function SidebarNav({ stockAlertCount = 0 }: { stockAlertCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-5 space-y-0.5">
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        const showBadge =
          "stockAlerts" in item && item.stockAlerts && stockAlertCount > 0;

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
                active ? "text-white" : "text-white/50",
              )}
              strokeWidth={2}
            />
            <span className="truncate flex-1">{item.label}</span>
            {showBadge && (
              <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-500 text-amber-950 text-[10px] font-bold flex items-center justify-center">
                {stockAlertCount > 99 ? "99+" : stockAlertCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
