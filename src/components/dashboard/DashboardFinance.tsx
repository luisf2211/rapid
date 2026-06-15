import { formatMoney } from "@/lib/formatters/money";
import { formatPieceCount } from "@/lib/labor-order/piece-count";
import { Boxes, Wrench } from "lucide-react";

export function DashboardFinance({
  totalMaterials,
  totalLaborAmount,
  totalLaborPieces,
}: {
  totalMaterials: number;
  totalLaborAmount: number;
  totalLaborPieces: number;
}) {
  const grandTotal = totalMaterials + totalLaborAmount;

  return (
    <section className="rounded-2xl bg-rapid-black text-white p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
        Costos internos
      </p>
      <p className="text-3xl sm:text-4xl font-bold tabular-nums mt-2 text-rapid-green">
        {formatMoney(grandTotal)}
      </p>
      <p className="text-xs text-white/45 mt-1">
        Materiales + mano de obra registrada
      </p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-white/70">
            <Wrench className="w-4 h-4 text-rapid-green" />
            Mano de obra
          </span>
          <span className="font-mono font-semibold tabular-nums">
            {formatMoney(totalLaborAmount)}
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
        <div className="flex items-center justify-between gap-3 text-xs text-white/45 pt-1 border-t border-white/10">
          <span>Piezas MO acumuladas</span>
          <span className="font-mono tabular-nums">
            {formatPieceCount(totalLaborPieces)}
          </span>
        </div>
      </div>
    </section>
  );
}
