import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  Coins,
} from "lucide-react";
import { formatMoney } from "@/lib/formatters/money";
import type { FinanceStats } from "@/services/finance-stats.service";

export function DashboardAccounting({ stats }: { stats: FinanceStats }) {
  const profitPositive = stats.netProfit >= 0;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-rapid-text">Contabilidad</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Ingresos"
          value={stats.income}
          subtitle={`${stats.invoiceCount} factura${stats.invoiceCount !== 1 ? "s" : ""}`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-emerald-600"
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Costos internos"
          value={stats.internalCosts}
          subtitle="Materiales + MO"
          icon={<Wallet className="w-4 h-4" />}
          color="text-blue-600"
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Gastos"
          value={stats.expenses}
          subtitle={`${stats.expenseCount} registro${stats.expenseCount !== 1 ? "s" : ""}`}
          icon={<TrendingDown className="w-4 h-4" />}
          color="text-red-600"
          iconBg="bg-red-50 text-red-600"
        />
        <StatCard
          label="Utilidad neta"
          value={stats.netProfit}
          subtitle="Ingresos − costos − gastos"
          icon={
            profitPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )
          }
          color={profitPositive ? "text-emerald-600" : "text-red-600"}
          iconBg={profitPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Balances */}
        <div className="card p-4 space-y-3">
          <p className="text-xs font-medium text-rapid-text-muted">
            Liquidez disponible
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-rapid-text-muted">
                <Landmark className="w-3.5 h-3.5 text-blue-500" />
                Bancos
              </span>
              <span className="font-mono font-medium tabular-nums text-sm text-rapid-text">
                {formatMoney(stats.bankBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-rapid-text-muted">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                Caja chica
              </span>
              <span className="font-mono font-medium tabular-nums text-sm text-rapid-text">
                {formatMoney(stats.pettyCashBalance)}
              </span>
            </div>
            <div className="pt-2 border-t border-rapid-hairline flex items-center justify-between">
              <span className="text-sm font-medium text-rapid-text">Total</span>
              <span className="font-mono font-semibold tabular-nums text-rapid-text">
                {formatMoney(stats.bankBalance + stats.pettyCashBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly income */}
        <div className="card p-4">
          <p className="text-xs font-medium text-rapid-text-muted mb-3">
            Ingresos mensuales
          </p>
          <MonthlyBars data={stats.monthlyIncome} color="bg-emerald-500" />
        </div>

        {/* Expenses by category */}
        <div className="card p-4">
          <p className="text-xs font-medium text-rapid-text-muted mb-3">
            Gastos por categoría
          </p>
          {stats.expensesByCategory.length === 0 ? (
            <p className="text-sm text-rapid-text-muted-soft">Sin gastos registrados</p>
          ) : (
            <div className="space-y-2">
              {stats.expensesByCategory.slice(0, 5).map((cat) => (
                <div key={cat.categoryName} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-xs text-rapid-text-body truncate">{cat.categoryName}</span>
                  <span className="text-xs font-mono font-medium tabular-nums text-rapid-text">
                    {formatMoney(cat.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  color,
  iconBg,
}: {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <span className="text-xs text-rapid-text-muted font-medium">{label}</span>
      </div>
      <p className={`text-lg font-semibold tabular-nums ${color}`}>
        {formatMoney(value)}
      </p>
      <p className="text-[11px] text-rapid-text-muted-soft mt-1">{subtitle}</p>
    </div>
  );
}

function MonthlyBars({
  data,
  color,
}: {
  data: { month: string; amount: number }[];
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d) => {
        const height = max > 0 ? (d.amount / max) * 100 : 0;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end h-12">
              <div
                className={`w-full rounded-sm ${color} transition-all min-h-[2px]`}
                style={{ height: `${Math.max(height, 4)}%` }}
                title={formatMoney(d.amount)}
              />
            </div>
            <span className="text-[9px] text-rapid-text-muted-soft">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}
