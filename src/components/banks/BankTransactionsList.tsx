"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatMoney } from "@/lib/formatters/money";
import { formatDate } from "@/lib/formatters/date";

type Transaction = {
  id: number;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  reference: string | null;
  transactionDate: string;
  category: string | null;
  notes: string | null;
};

export function BankTransactionsList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="card divide-y divide-rapid-border">
      {transactions.map((tx) => {
        const isCredit = tx.transactionType === "CREDIT";
        return (
          <div key={tx.id} className="p-4 flex items-start gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isCredit ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {isCredit ? (
                <ArrowUpCircle className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-rapid-text-muted">
                  {formatDate(tx.transactionDate)}
                </p>
                {tx.reference && (
                  <span className="text-xs text-rapid-text-muted">
                    · Ref: {tx.reference}
                  </span>
                )}
                {tx.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rapid-bg text-rapid-text-muted font-medium">
                    {tx.category}
                  </span>
                )}
              </div>
              {tx.notes && (
                <p className="text-xs text-rapid-text-muted mt-1 italic">
                  {tx.notes}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-bold tabular-nums ${
                  isCredit ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCredit ? "+" : "−"}
                {formatMoney(tx.amount)}
              </p>
              <p className="text-[11px] text-rapid-text-muted tabular-nums">
                Saldo: {formatMoney(tx.balanceAfter)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
