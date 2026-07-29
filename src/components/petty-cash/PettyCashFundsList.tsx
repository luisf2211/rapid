"use client";

import Link from "next/link";
import { Coins, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/formatters/money";
import { useTransition } from "react";
import { deletePettyCashFundAction } from "@/app/(app)/petty-cash/actions";

type FundItem = {
  id: number;
  name: string;
  fundLimit: number;
  currentBalance: number;
  custodian: string | null;
};

export function PettyCashFundsList({ funds }: { funds: FundItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {funds.map((fund) => (
        <FundCard key={fund.id} fund={fund} />
      ))}
    </div>
  );
}

function FundCard({ fund }: { fund: FundItem }) {
  const [isPending, startTransition] = useTransition();
  const usedPercent =
    fund.fundLimit > 0
      ? ((fund.fundLimit - fund.currentBalance) / fund.fundLimit) * 100
      : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`¿Eliminar el fondo "${fund.name}"?`)) return;
    startTransition(async () => {
      await deletePettyCashFundAction(fund.id);
    });
  };

  return (
    <Link
      href={`/petty-cash/${fund.id}`}
      className={`card p-5 hover:shadow-md transition group ${isPending ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">{fund.name}</p>
            {fund.custodian && (
              <p className="text-xs text-rapid-text-muted">{fund.custodian}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-rapid-text-muted hover:text-red-600 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-rapid-text-muted">Disponible</span>
          <span className="text-lg font-bold tabular-nums text-amber-600">
            {formatMoney(fund.currentBalance)}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${Math.min(100, 100 - usedPercent)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[11px] text-rapid-text-muted">
          <span>Gastado: {formatMoney(fund.fundLimit - fund.currentBalance)}</span>
          <span>Límite: {formatMoney(fund.fundLimit)}</span>
        </div>
      </div>
    </Link>
  );
}
