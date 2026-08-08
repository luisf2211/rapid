import { Landmark } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listBankAccounts, getBankAccountsTotalBalance } from "@/services/banks.service";
import { toPlainNumber } from "@/lib/serialize";
import { formatMoney } from "@/lib/formatters/money";
import { BankAccountsList } from "@/components/banks/BankAccountsList";
import { CreateBankAccountDialog } from "@/components/banks/CreateBankAccountDialog";

export const dynamic = "force-dynamic";

export default async function BanksPage() {
  let accounts: Awaited<ReturnType<typeof listBankAccounts>> = [];
  let totalBalance = 0;
  let error: string | null = null;

  try {
    [accounts, totalBalance] = await Promise.all([
      listBankAccounts(),
      getBankAccountsTotalBalance(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const accountsData = accounts.map((a) => ({
    id: a.Id,
    accountName: a.AccountName,
    bankName: a.BankName,
    accountNumber: a.AccountNumber,
    accountType: a.AccountType,
    currency: a.Currency,
    currentBalance: toPlainNumber(a.CurrentBalance) ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Bancos"
        subtitle="Cuentas bancarias del taller y sus balances."
        actions={<CreateBankAccountDialog />}
      />

      {accounts.length > 0 && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Landmark className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-rapid-text-muted">Balance total</p>
            <p className="text-lg font-semibold tabular-nums text-blue-600">
              {formatMoney(totalBalance)}
            </p>
          </div>
          <p className="ml-auto text-xs text-rapid-text-muted">
            {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {!error && accounts.length === 0 && (
        <div className="card p-12 text-center">
          <Landmark className="w-10 h-10 mx-auto text-rapid-text-muted-soft mb-3" />
          <p className="text-sm font-medium text-rapid-text">No hay cuentas bancarias</p>
          <p className="text-xs text-rapid-text-muted mt-1">
            Registra las cuentas del taller para llevar el control del dinero.
          </p>
        </div>
      )}

      {!error && accounts.length > 0 && (
        <BankAccountsList accounts={accountsData} />
      )}
    </>
  );
}
