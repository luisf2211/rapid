"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { InventoryStockAlert } from "@/lib/inventory/alerts";
import { stockAlertLabel } from "@/lib/inventory/alerts";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

interface Props {
  alerts: InventoryStockAlert[];
  total: number;
}

export function SidebarStockAlerts({ alerts, total }: Props) {
  const { collapsed } = useSidebar();

  if (total === 0) return null;

  if (collapsed) {
    return (
      <div className="px-2 pb-3">
        <Link
          href="/inventory?filter=low"
          title={`Stock bajo: ${total} pieza${total === 1 ? "" : "s"}`}
          className="relative flex h-9 w-full items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <AlertTriangle className="h-4 w-4" strokeWidth={2} />
          <span className="absolute -top-1 -right-1 min-h-[16px] min-w-[16px] px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
            {total > 99 ? "99+" : total}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-3 rounded-xl bg-amber-50 border border-amber-200 overflow-hidden">
      <div className="px-3 py-2.5 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-amber-800 leading-tight">
            Stock bajo · {total === 1 ? "1 pieza" : `${total} piezas`}
          </p>
        </div>
      </div>

      <ul className="max-h-28 overflow-y-auto border-t border-amber-200/60">
        {alerts.map((a) => (
          <li key={a.id}>
            <Link
              href={`/inventory/${a.id}`}
              className="block px-3 py-2 hover:bg-amber-100/50 transition-colors"
            >
              <p className="text-xs font-medium text-rapid-text truncate">
                {a.sku}
              </p>
              <p
                className={cn(
                  "text-[10px] mt-0.5 truncate",
                  a.level === "out" ? "text-red-600" : "text-amber-600",
                )}
              >
                {stockAlertLabel(a)}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/inventory?filter=low"
        className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100/50 border-t border-amber-200/60 transition-colors"
      >
        Ver todo
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
