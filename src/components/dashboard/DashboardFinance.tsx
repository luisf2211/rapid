import { formatMoney } from "@/lib/formatters/money";
import { Boxes, Wrench } from "lucide-react";

export function DashboardFinance({
  totalMaterials,
  totalLabor,
}: {
  totalMaterials: number;
  totalLabor: number;
}) {
  const total = totalMaterials + totalLabor;
  const laborPct = total > 0 ? Math.round((totalLabor / total) * 100) : 50;

  return (
    <section className="rounded-2xl bg-rapid-black text-white p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
        Facturación acumulada
      </p>
      <p className="text-3xl sm:text-4xl font-bold tabular-nums mt-2 text-rapid-green">
        {formatMoney(total)}
      </p>
      <p className="text-xs text-white/45 mt-1">
        Suma de materiales y mano de obra registrados
      </p>

      <div className="mt-5 h-1.5 rounded-full bg-white/10 overflow-hidden flex">
        <div
          className="h-full bg-rapid-green transition-all"
          style={{ width: `${laborPct}%` }}
        />
        <div
          className="h-full bg-white/30 flex-1"
          style={{ width: `${100 - laborPct}%` }}
        />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-white/70">
            <Wrench className="w-4 h-4 text-rapid-green" />
            Mano de obra
          </span>
          <span className="font-mono font-semibold tabular-nums">
            {formatMoney(totalLabor)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-white/70">
            <Boxes className="w-4 h-4 text-white/50" />
            Materiales
          </span>
          <span className="font-mono font-semibold tabular-nums">
            {formatMoney(totalMaterials)}
          </span>
        </div>
      </div>
    </section>
  );
}
