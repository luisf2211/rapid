import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBankAccount, listBankTransactions } from "@/services/banks.service";
import { toPlainNumber } from "@/lib/serialize";
import { formatMoney } from "@/lib/formatters/money";
import { BankTransactionsList } from "@/components/banks/BankTransactionsList";
import { NewBankTransactionForm } from "@/components/banks/NewBankTransactionForm";
import { BANK_ACCOUNT_TYPES } from "@/lib/validations/bank";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function BankAccountDetailPage({ params }: PageProps) {
  const { id } = await params;
  const account = await getBankAccount(Number(id));
  if (!account) notFound();

  const transactions = await listBankTransactions(account.Id);

  const currentBalance = toPlainNumber(account.CurrentBalance) ?? 0;
  const accountTypeLabel =
    BANK_ACCOUNT_TYPES.find((t) => t.value === account.AccountType)?.label ??
    account.AccountType;

  const txData = transactions.map((tx) => ({
    id: tx.Id,
    transactionType: tx.TransactionType,
    amount: toPlainNumber(tx.Amount) ?? 0,
    balanceAfter: toPlainNumber(tx.BalanceAfter) ?? 0,
    description: tx.Description,
    reference: tx.Reference,
    transactionDate: tx.TransactionDate.toISOString(),
    category: tx.Category,
    notes: tx.Notes,
  }));

  return (
    <>
      <PageHeader
        title={account.AccountName}
        subtitle={`${account.BankName} · ${accountTypeLabel} · ${account.Currency}`}
        actions={
          <Link href="/banks" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-rapid-text-muted">Balance actual</p>
          <p
            className={`text-2xl font-bold tabular-nums ${
              currentBalance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {formatMoney(currentBalance)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-rapid-text-muted">Banco</p>
          <p className="text-lg font-semibold">{account.BankName}</p>
          {account.AccountNumber && (
            <p className="text-xs text-rapid-text-muted mt-0.5">
              ****{account.AccountNumber.slice(-4)}
            </p>
          )}
        </div>
        <div className="card p-4">
          <p className="text-xs text-rapid-text-muted">Movimientos</p>
          <p className="text-2xl font-bold tabular-nums">
            {transactions.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-bold text-lg mb-3">Movimientos recientes</h2>
          {txData.length === 0 ? (
            <div className="card p-8 text-center text-rapid-text-muted">
              <Landmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No hay movimientos registrados
            </div>
          ) : (
            <BankTransactionsList transactions={txData} />
          )}
        </div>
        <div>
          <h2 className="font-bold text-lg mb-3">Registrar movimiento</h2>
          <NewBankTransactionForm bankAccountId={account.Id} />
        </div>
      </div>
    </>
  );
}
