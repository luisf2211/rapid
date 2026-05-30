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
          className="relative flex h-11 w-full items-center justify-center rounded-xl bg-amber-500/[0.12] text-amber-300 hover:bg-amber-500/20 transition"
        >
          <AlertTriangle className="h-5 w-5" strokeWidth={2} />
          <span className="absolute -top-0.5 -right-0.5 min-h-[18px] min-w-[18px] px-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0c100f]">
            {total > 99 ? "99+" : total}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-4 rounded-2xl bg-amber-500/[0.08] ring-1 ring-amber-500/20 overflow-hidden">
      <div className="px-4 py-3 flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-semibold text-amber-100/95 leading-snug">
            Stock bajo
          </p>
          <p className="text-[11px] text-amber-200/60 mt-0.5">
            {total === 1 ? "1 pieza" : `${total} piezas`}
          </p>
        </div>
      </div>

      <ul className="max-h-36 overflow-y-auto border-t border-amber-500/15">
        {alerts.map((a) => (
          <li key={a.id}>
            <Link
              href={`/inventory/${a.id}`}
              className="block px-4 py-2.5 hover:bg-white/[0.04] transition"
            >
              <p className="text-xs font-medium text-white/90 truncate">
                {a.sku}
              </p>
              <p
                className={cn(
                  "text-[10px] mt-0.5 truncate",
                  a.level === "out" ? "text-red-300/90" : "text-amber-200/70",
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
        className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-medium text-amber-200/90 hover:bg-white/[0.04] border-t border-amber-500/15 transition"
      >
        Ver todo
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
