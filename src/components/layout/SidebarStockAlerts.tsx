import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { InventoryStockAlert } from "@/lib/inventory/alerts";
import { stockAlertLabel } from "@/lib/inventory/alerts";
import { cn } from "@/lib/utils";

interface Props {
  alerts: InventoryStockAlert[];
  total: number;
}

export function SidebarStockAlerts({ alerts, total }: Props) {
  if (total === 0) return null;

  return (
    <div className="mx-3 mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 overflow-hidden">
      <div className="px-3 py-2.5 flex items-center gap-2 border-b border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs font-semibold text-amber-100 leading-snug">
          {total === 1
            ? "1 pieza sin stock suficiente"
            : `${total} piezas sin stock suficiente`}
        </p>
      </div>
      <ul className="max-h-44 overflow-y-auto py-1">
        {alerts.map((a) => (
          <li key={a.id}>
            <Link
              href={`/inventory/${a.id}`}
              className="block px-3 py-2 hover:bg-white/5 transition"
            >
              <p className="text-xs font-medium text-white truncate">
                {a.sku} · {a.name}
              </p>
              <p
                className={cn(
                  "text-[10px] mt-0.5",
                  a.level === "out"
                    ? "text-red-300"
                    : "text-amber-200/90",
                )}
              >
                {stockAlertLabel(a)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {total > alerts.length && (
        <p className="px-3 py-1.5 text-[10px] text-white/50 border-t border-amber-500/20">
          y {total - alerts.length} más…
        </p>
      )}
      <Link
        href="/inventory?filter=low"
        className="block px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-white/5 border-t border-amber-500/20"
      >
        Ver inventario →
      </Link>
    </div>
  );
}
