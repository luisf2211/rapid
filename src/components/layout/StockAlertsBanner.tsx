import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { InventoryStockAlert } from "@/lib/inventory/alerts";

interface Props {
  alerts: InventoryStockAlert[];
  total: number;
}

export function StockAlertsBanner({ alerts, total }: Props) {
  if (total === 0) return null;

  const preview = alerts.slice(0, 3);
  const names = preview
    .map((a) => `${a.sku} (${a.level === "out" ? "sin stock" : "bajo"})`)
    .join(", ");

  return (
    <div
      role="status"
      className="shrink-0 bg-amber-50 border-b border-amber-100 px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800">
          <span className="font-semibold">
            {total === 1
              ? "1 alerta de inventario:"
              : `${total} alertas de inventario:`}
          </span>{" "}
          <span className="text-amber-700">{names}</span>
          {total > preview.length && (
            <span className="text-amber-600">
              {" "}y {total - preview.length} más
            </span>
          )}
        </p>
      </div>
      <Link
        href="/inventory?filter=low"
        className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors shrink-0"
      >
        Revisar →
      </Link>
    </div>
  );
}
