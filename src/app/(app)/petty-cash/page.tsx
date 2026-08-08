import { Coins } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listPettyCashFunds } from "@/services/petty-cash.service";
import { toPlainNumber } from "@/lib/serialize";
import { formatMoney } from "@/lib/formatters/money";
import { PettyCashFundsList } from "@/components/petty-cash/PettyCashFundsList";
import { CreateFundDialog } from "@/components/petty-cash/CreateFundDialog";

export const dynamic = "force-dynamic";

export default async function PettyCashPage() {
  let funds: Awaited<ReturnType<typeof listPettyCashFunds>> = [];
  let error: string | null = null;

  try {
    funds = await listPettyCashFunds();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const totalBalance = funds.reduce(
    (sum, f) => sum + (toPlainNumber(f.CurrentBalance) ?? 0),
    0,
  );

  const fundsData = funds.map((f) => ({
    id: f.Id,
    name: f.Name,
    fundLimit: toPlainNumber(f.FundLimit) ?? 0,
    currentBalance: toPlainNumber(f.CurrentBalance) ?? 0,
    custodian: f.Custodian,
  }));

  return (
    <>
      <PageHeader
        title="Caja chica"
        subtitle="Fondos fijos para gastos menores del día a día."
        actions={<CreateFundDialog />}
      />

      {totalBalance > 0 && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] text-rapid-text-muted">Balance disponible</p>
            <p className="text-lg font-semibold tabular-nums text-amber-600">
              {formatMoney(totalBalance)}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {!error && funds.length === 0 && (
        <div className="card p-12 text-center">
          <Coins className="w-10 h-10 mx-auto text-rapid-text-muted-soft mb-3" />
          <p className="text-sm font-medium text-rapid-text">No hay fondos de caja chica</p>
          <p className="text-xs text-rapid-text-muted mt-1">
            Crea un fondo para empezar a registrar gastos menores.
          </p>
        </div>
      )}

      {!error && funds.length > 0 && <PettyCashFundsList funds={fundsData} />}
    </>
  );
}
