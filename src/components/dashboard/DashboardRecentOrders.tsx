import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/formatters/date";

type Order = {
  id: number;
  orderNumber: number;
  customerName: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  plate: string | null;
  status: string;
  createdAt: Date | null;
};

export function DashboardRecentOrders({ orders }: { orders: Order[] }) {
  return (
    <section className="card overflow-hidden min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-rapid-border">
        <h2 className="text-sm font-semibold text-rapid-text">Actividad reciente</h2>
        <Link
          href="/work-orders"
          className="text-xs font-medium text-rapid-text-muted hover:text-rapid-text transition-colors inline-flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!orders.length ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-rapid-surface-strong flex items-center justify-center mb-3">
            <ClipboardList className="w-6 h-6 text-rapid-text-muted-soft" />
          </div>
          <p className="text-sm font-medium text-rapid-text">Sin órdenes aún</p>
          <p className="text-xs text-rapid-text-muted mt-1 max-w-xs">
            Cuando registres la primera recepción aparecerá aquí.
          </p>
          <Link href="/work-orders/new" className="btn-primary mt-4">
            Crear orden
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-rapid-hairline">
          {orders.map((o) => {
            const vehicle = [o.brand, o.model, o.vehicleYear]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={o.id}>
                <Link
                  href={`/work-orders/${o.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-rapid-surface-soft transition-colors group"
                >
                  <span className="shrink-0 font-mono text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-rapid-surface-strong text-rapid-text-muted">
                    {o.plate ?? "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-rapid-text truncate group-hover:text-rapid-green-dark transition-colors">
                      {o.customerName ?? "Sin cliente"}
                    </p>
                    <p className="text-[11px] text-rapid-text-muted truncate">
                      {vehicle || "Vehículo sin datos"} · #{String(o.orderNumber).padStart(5, "0")}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={o.status} />
                    <span className="text-[10px] text-rapid-text-muted-soft tabular-nums">
                      {formatDateTime(o.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
