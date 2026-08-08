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
    <section className="card p-4">
      <p className="text-xs font-medium text-rapid-text-muted">
        Costos internos
      </p>
      <p className="text-2xl font-semibold tabular-nums mt-1.5 text-rapid-text">
        {formatMoney(grandTotal)}
      </p>
      <p className="text-[11px] text-rapid-text-muted-soft mt-0.5">
        Materiales + mano de obra
      </p>

      <div className="mt-4 pt-3 border-t border-rapid-hairline space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-rapid-text-muted">
            <Wrench className="w-3.5 h-3.5 text-rapid-green" />
            Mano de obra
          </span>
          <span className="font-mono font-medium tabular-nums text-rapid-text">
            {formatMoney(totalLaborAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-rapid-text-muted">
            <Boxes className="w-3.5 h-3.5 text-rapid-text-muted-soft" />
            Materiales
          </span>
          <span className="font-mono font-medium tabular-nums text-rapid-text">
            {formatMoney(totalMaterials)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-rapid-text-muted pt-2 border-t border-rapid-hairline">
          <span>Piezas MO</span>
          <span className="font-mono tabular-nums">
            {formatPieceCount(totalLaborPieces)}
          </span>
        </div>
      </div>
    </section>
  );
}
