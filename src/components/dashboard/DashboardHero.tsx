import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { dashboardDateLabel, dashboardGreeting } from "@/lib/dashboard/greeting";

export function DashboardHero({
  activeInShop,
  totalOrders,
}: {
  activeInShop: number;
  totalOrders: number;
}) {
  const greeting = dashboardGreeting();
  const dateLabel = dashboardDateLabel();

  return (
    <section className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-rapid-text-muted capitalize">
            {dateLabel}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-rapid-text tracking-[-0.02em] mt-1">
            {greeting}
          </h1>
          <p className="text-sm text-rapid-text-muted mt-1">
            {activeInShop === 0
              ? "No hay vehículos activos en el taller."
              : activeInShop === 1
                ? "1 vehículo en taller ahora."
                : `${activeInShop} vehículos en taller ahora.`}
            {totalOrders > 0 && (
              <span className="text-rapid-text-muted-soft">
                {" "}· {totalOrders} órdenes en total
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href="/work-orders/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nueva orden
          </Link>
          <Link href="/quotations/new" className="btn-secondary">
            <FileText className="w-4 h-4" />
            Cotizar
          </Link>
        </div>
      </div>
    </section>
  );
}
