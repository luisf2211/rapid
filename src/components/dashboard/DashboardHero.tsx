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
    <section className="relative overflow-hidden rounded-2xl bg-rapid-black text-white mb-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-12deg, transparent, transparent 12px, #fff 12px, #fff 13px)",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rapid-green/20 blur-3xl" />
      <div className="relative px-6 py-7 sm:px-8 sm:py-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-rapid-green text-sm font-semibold tracking-wide capitalize">
            {dateLabel}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
            {greeting}
          </h1>
          <p className="text-white/55 text-sm mt-2 max-w-md">
            {activeInShop === 0
              ? "No hay vehículos activos en el taller ahora mismo."
              : activeInShop === 1
                ? "1 vehículo en taller ahora."
                : `${activeInShop} vehículos en taller ahora.`}{" "}
            {totalOrders > 0 && (
              <span className="text-white/40">
                · {totalOrders} órdenes en total
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href="/work-orders/new"
            className="inline-flex items-center gap-2 rounded-lg bg-rapid-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-rapid-green-dark transition"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nueva orden
          </Link>
          <Link
            href="/quotations/new"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            <FileText className="w-4 h-4" />
            Cotizar
          </Link>
        </div>
      </div>
    </section>
  );
}
