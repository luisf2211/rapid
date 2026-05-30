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
    <section className="card overflow-hidden min-h-[320px] flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-rapid-border">
        <h2 className="font-bold text-rapid-text">Actividad reciente</h2>
        <Link
          href="/work-orders"
          className="text-sm font-medium text-rapid-green-dark hover:underline inline-flex items-center gap-1"
        >
          Todas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {!orders.length ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rapid-bg flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-rapid-text-muted/40" />
          </div>
          <p className="font-medium text-rapid-text">Sin órdenes aún</p>
          <p className="text-sm text-rapid-text-muted mt-1 max-w-xs">
            Cuando registres la primera recepción aparecerá aquí.
          </p>
          <Link href="/work-orders/new" className="btn-primary mt-5">
            Crear orden
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-rapid-border">
          {orders.map((o) => {
            const vehicle = [o.brand, o.model, o.vehicleYear]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={o.id}>
                <Link
                  href={`/work-orders/${o.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-rapid-bg/60 transition group"
                >
                  <span className="shrink-0 font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-rapid-black text-rapid-green">
                    {o.plate ?? "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-rapid-text truncate group-hover:text-rapid-green-dark transition">
                      {o.customerName ?? "Sin cliente"}
                    </p>
                    <p className="text-xs text-rapid-text-muted truncate">
                      {vehicle || "Vehículo sin datos"} · ORD-
                      {String(o.orderNumber).padStart(5, "0")}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={o.status} />
                    <span className="text-[10px] text-rapid-text-muted tabular-nums">
                      {formatDateTime(o.createdAt)}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rapid-text-muted/30 group-hover:text-rapid-text shrink-0 sm:hidden" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
