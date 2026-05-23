"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Boxes, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/work-orders", label: "Órdenes", icon: ClipboardList },
  { href: "/material-requisitions", label: "Materiales", icon: Boxes },
  { href: "/labor-orders", label: "Mano de obra", icon: Wrench },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-rapid-border flex">
      {items.map((it) => {
        const Icon = it.icon;
        const active =
          pathname === it.href ||
          (it.href !== "/dashboard" && pathname.startsWith(it.href));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium gap-0.5",
              active
                ? "text-rapid-green-dark"
                : "text-rapid-text-muted hover:text-rapid-text",
            )}
          >
            <Icon className="w-4.5 h-4.5" />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
