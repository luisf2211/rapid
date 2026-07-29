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
  transactionDate: string;
  notes: string | null;
  createdBy: string | null;
};

export function PettyCashTransactionsList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="card divide-y divide-rapid-border">
      {transactions.map((tx) => {
        const isDisbursement = tx.transactionType === "DISBURSEMENT";
        return (
          <div key={tx.id} className="p-4 flex items-start gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isDisbursement ? "bg-red-50" : "bg-green-50"
              }`}
            >
              {isDisbursement ? (
                <ArrowDownCircle className="w-4 h-4 text-red-600" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <p className="text-xs text-rapid-text-muted mt-0.5">
                {formatDate(tx.transactionDate)}
                {tx.createdBy && ` · ${tx.createdBy}`}
              </p>
              {tx.notes && (
                <p className="text-xs text-rapid-text-muted mt-1 italic">
                  {tx.notes}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-bold tabular-nums ${
                  isDisbursement ? "text-red-600" : "text-green-600"
                }`}
              >
                {isDisbursement ? "−" : "+"}
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
