import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  Coins,
  BarChart3,
} from "lucide-react";
import { formatMoney } from "@/lib/formatters/money";
import type { FinanceStats } from "@/services/finance-stats.service";

export function DashboardAccounting({ stats }: { stats: FinanceStats }) {
  const profitPositive = stats.netProfit >= 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-rapid-green" />
        <h2 className="font-bold text-lg">Contabilidad</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Ingresos"
          value={stats.income}
          subtitle={`${stats.invoiceCount} factura${stats.invoiceCount !== 1 ? "s" : ""} pagada${stats.invoiceCount !== 1 ? "s" : ""}`}
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          label="Costos internos"
          value={stats.internalCosts}
          subtitle="Materiales + mano de obra"
          icon={<Wallet className="w-4 h-4 text-blue-600" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Gastos operativos"
          value={stats.expenses}
          subtitle={`${stats.expenseCount} registro${stats.expenseCount !== 1 ? "s" : ""}`}
          icon={<TrendingDown className="w-4 h-4 text-red-600" />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Utilidad neta"
          value={stats.netProfit}
          subtitle="Ingresos − costos − gastos"
          icon={
            profitPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )
          }
          color={profitPositive ? "text-emerald-600" : "text-red-600"}
          bgColor={profitPositive ? "bg-emerald-50" : "bg-red-50"}
        />
      </div>

      {/* Second row: Balances + Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Balances */}
        <div className="card p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-rapid-text-muted">
            Liquidez disponible
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-rapid-text-muted">
                <Landmark className="w-4 h-4 text-blue-500" />
                Bancos
              </span>
              <span className="font-mono font-semibold tabular-nums text-sm">
                {formatMoney(stats.bankBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-rapid-text-muted">
                <Coins className="w-4 h-4 text-amber-500" />
                Caja chica
              </span>
              <span className="font-mono font-semibold tabular-nums text-sm">
                {formatMoney(stats.pettyCashBalance)}
              </span>
            </div>
            <div className="pt-2 border-t border-rapid-border flex items-center justify-between">
              <span className="text-sm font-medium">Total disponible</span>
              <span className="font-mono font-bold tabular-nums">
                {formatMoney(stats.bankBalance + stats.pettyCashBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly chart (simple bar representation) */}
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-rapid-text-muted mb-3">
            Ingresos mensuales
          </p>
          <MonthlyBars data={stats.monthlyIncome} color="bg-green-500" />
        </div>

        {/* Expenses by category */}
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-rapid-text-muted mb-3">
            Gastos por categoría
          </p>
          {stats.expensesByCategory.length === 0 ? (
            <p className="text-sm text-rapid-text-muted">Sin gastos registrados</p>
          ) : (
            <div className="space-y-2">
              {stats.expensesByCategory.slice(0, 5).map((cat) => (
                <div key={cat.categoryName} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-xs truncate">{cat.categoryName}</span>
                  <span className="text-xs font-mono font-semibold tabular-nums">
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
  bgColor,
}: {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bgColor}`}>
          {icon}
        </div>
        <span className="text-xs text-rapid-text-muted font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold tabular-nums ${color}`}>
        {formatMoney(value)}
      </p>
      <p className="text-[11px] text-rapid-text-muted mt-1">{subtitle}</p>
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
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d) => {
        const height = max > 0 ? (d.amount / max) * 100 : 0;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end h-14">
              <div
                className={`w-full rounded-t ${color} transition-all min-h-[2px]`}
                style={{ height: `${Math.max(height, 3)}%` }}
                title={formatMoney(d.amount)}
              />
            </div>
            <span className="text-[9px] text-rapid-text-muted">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}
