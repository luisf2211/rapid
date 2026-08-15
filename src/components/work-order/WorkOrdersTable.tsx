"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/formatters/date";

export type WorkOrderListItem = {
  id: number;
  orderNumber: number;
  customerName: string | null;
  phone: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  plate: string | null;
  status: string;
  materialCount: number;
  laborCount: number;
  createdAt: Date | null;
};

export function WorkOrdersTable({ items }: { items: WorkOrderListItem[] }) {
  const router = useRouter();

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rapid-border bg-rapid-surface text-left text-xs uppercase tracking-wide text-rapid-text-muted">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Vehículo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-center hidden lg:table-cell">Mat.</th>
              <th className="px-4 py-3 font-medium text-center hidden lg:table-cell">MO</th>
              <th className="px-4 py-3 font-medium hidden xl:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr
                key={o.id}
                onClick={() => router.push(`/work-orders/${o.id}`)}
                className="border-b border-rapid-border last:border-0 hover:bg-rapid-green-soft/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5 font-semibold text-rapid-green whitespace-nowrap">
                  {String(o.orderNumber).padStart(5, "0")}
                </td>
                <td className="px-4 py-3.5 min-w-[130px]">
                  <p className="font-medium text-rapid-text leading-tight">
                    {o.customerName ?? "—"}
                  </p>
                  {o.phone && (
                    <p className="text-[11px] text-rapid-text-muted mt-0.5">{o.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3.5 text-rapid-text-muted hidden md:table-cell min-w-[140px]">
                  <p className="font-medium text-rapid-text">
                    {[o.brand, o.model].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-[11px] text-rapid-text-muted mt-0.5">
                    {[o.vehicleYear ? String(o.vehicleYear) : null, o.plate].filter(Boolean).join(" · ") || ""}
                  </p>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rapid-surface-strong text-rapid-text-muted text-[11px] font-medium tabular-nums">
                    {o.materialCount}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rapid-surface-strong text-rapid-text-muted text-[11px] font-medium tabular-nums">
                    {o.laborCount}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden xl:table-cell whitespace-nowrap">
                  <p className="text-[11px] text-rapid-text-muted">{o.createdAt ? formatDateTime(o.createdAt) : "—"}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2.5 text-xs text-rapid-text-muted border-t border-rapid-border bg-rapid-surface/50">
        {items.length} orden{items.length !== 1 ? "es" : ""} · Toca una fila para ver el detalle.
      </p>
    </div>
  );
}
