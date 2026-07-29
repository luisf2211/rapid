"use client";

import Link from "next/link";
import { Landmark, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/formatters/money";
import { useTransition } from "react";
import { deleteBankAccountAction } from "@/app/(app)/banks/actions";
import { BANK_ACCOUNT_TYPES } from "@/lib/validations/bank";

type AccountItem = {
  id: number;
  accountName: string;
  bankName: string;
  accountNumber: string | null;
  accountType: string;
  currency: string;
  currentBalance: number;
};

export function BankAccountsList({ accounts }: { accounts: AccountItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <BankAccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}

function BankAccountCard({ account }: { account: AccountItem }) {
  const [isPending, startTransition] = useTransition();
  const typeLabel =
    BANK_ACCOUNT_TYPES.find((t) => t.value === account.accountType)?.label ??
    account.accountType;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`¿Eliminar la cuenta "${account.accountName}"?`)) return;
    startTransition(async () => {
      await deleteBankAccountAction(account.id);
    });
  };

  return (
    <Link
      href={`/banks/${account.id}`}
      className={`card p-5 hover:shadow-md transition group ${isPending ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <Landmark className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">{account.accountName}</p>
            <p className="text-xs text-rapid-text-muted">
              {account.bankName} · {typeLabel}
            </p>
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
          <span className="text-xs text-rapid-text-muted">Balance</span>
          <span
            className={`text-lg font-bold tabular-nums ${
              account.currentBalance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatMoney(account.currentBalance)}
          </span>
        </div>
        {account.accountNumber && (
          <p className="text-[11px] text-rapid-text-muted mt-2">
            ****{account.accountNumber.slice(-4)} · {account.currency}
          </p>
        )}
      </div>
    </Link>
  );
}
