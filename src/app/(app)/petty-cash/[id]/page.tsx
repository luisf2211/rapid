import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getPettyCashFund,
  listPettyCashTransactions,
} from "@/services/petty-cash.service";
import { toPlainNumber } from "@/lib/serialize";
import { formatMoney } from "@/lib/formatters/money";
import { PettyCashTransactionsList } from "@/components/petty-cash/PettyCashTransactionsList";
import { NewTransactionForm } from "@/components/petty-cash/NewTransactionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function PettyCashFundDetailPage({ params }: PageProps) {
  const { id } = await params;
  const fund = await getPettyCashFund(Number(id));
  if (!fund) notFound();

  const transactions = await listPettyCashTransactions(fund.Id);

  const currentBalance = toPlainNumber(fund.CurrentBalance) ?? 0;
  const fundLimit = toPlainNumber(fund.FundLimit) ?? 0;
  const usedPercent = fundLimit > 0 ? ((fundLimit - currentBalance) / fundLimit) * 100 : 0;

  const txData = transactions.map((tx) => ({
    id: tx.Id,
    transactionType: tx.TransactionType,
    amount: toPlainNumber(tx.Amount) ?? 0,
    balanceAfter: toPlainNumber(tx.BalanceAfter) ?? 0,
    description: tx.Description,
    transactionDate: tx.TransactionDate.toISOString(),
    notes: tx.Notes,
    createdBy: tx.CreatedBy,
  }));

  return (
    <>
      <PageHeader
        title={fund.Name}
        subtitle={fund.Custodian ? `Custodio: ${fund.Custodian}` : undefined}
        actions={
          <Link href="/petty-cash" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-rapid-text-muted">Balance disponible</p>
          <p className="text-2xl font-bold tabular-nums text-amber-600">
            {formatMoney(currentBalance)}
          </p>
          <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${Math.min(100, 100 - usedPercent)}%` }}
            />
          </div>
        </div>
        <div className="card p-4">
          <p className="text-xs text-rapid-text-muted">Límite del fondo</p>
          <p className="text-2xl font-bold tabular-nums">
            {formatMoney(fundLimit)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-rapid-text-muted">Gastado</p>
          <p className="text-2xl font-bold tabular-nums text-red-600">
            {formatMoney(fundLimit - currentBalance)}
          </p>
          <p className="text-xs text-rapid-text-muted mt-1">
            {usedPercent.toFixed(0)}% utilizado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-bold text-lg mb-3">Movimientos</h2>
          {txData.length === 0 ? (
            <div className="card p-8 text-center text-rapid-text-muted">
              <Coins className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No hay movimientos registrados
            </div>
          ) : (
            <PettyCashTransactionsList transactions={txData} />
          )}
        </div>
        <div>
          <h2 className="font-bold text-lg mb-3">Registrar movimiento</h2>
          <NewTransactionForm fundId={fund.Id} currentBalance={currentBalance} fundLimit={fundLimit} />
        </div>
      </div>
    </>
  );
}
