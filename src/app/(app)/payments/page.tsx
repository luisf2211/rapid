import Link from "next/link";
import { Wallet, CalendarRange } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getOrCreateCurrentPayrollPeriod,
  listEmployeePayments,
  listPayrollPeriods,
  payrollPeriodLabel,
} from "@/services/payroll.service";
import { formatMoney } from "@/lib/formatters/money";
import { formatDate } from "@/lib/formatters/date";
import {
  EMPLOYEE_PAYMENT_TYPE_LABELS,
  PAYROLL_PERIOD_STATUS_LABELS,
} from "@/lib/constants";
import { employeeDisplayName } from "@/lib/employee/display";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  let currentPeriod: Awaited<ReturnType<typeof getOrCreateCurrentPayrollPeriod>> | null =
    null;
  let recentPayments: Awaited<ReturnType<typeof listEmployeePayments>> = [];
  let periods: Awaited<ReturnType<typeof listPayrollPeriods>> = [];
  let error: string | null = null;

  try {
    [currentPeriod, recentPayments, periods] = await Promise.all([
      getOrCreateCurrentPayrollPeriod(),
      listEmployeePayments({ limit: 10 }),
      listPayrollPeriods(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Pagos a empleados"
        subtitle="Anticipos de efectivo y liquidación quincenal."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/payments/advances/new" className="btn-secondary">
              <Wallet className="w-4 h-4" /> Anticipo
            </Link>
            {currentPeriod && (
              <Link href={`/payments/periods/${currentPeriod.Id}`} className="btn-primary">
                <CalendarRange className="w-4 h-4" /> Quincena actual
              </Link>
            )}
          </div>
        }
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {currentPeriod && (
        <div className="card p-5 mb-4 border-l-4 border-l-rapid-green">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-medium text-rapid-text-muted">
                Quincena en curso
              </p>
              <p className="text-lg font-semibold mt-0.5 text-rapid-text">
                {payrollPeriodLabel(currentPeriod)}
              </p>
              <p className="text-xs text-rapid-text-muted mt-1">
                Estado:{" "}
                {PAYROLL_PERIOD_STATUS_LABELS[currentPeriod.Status] ?? currentPeriod.Status}
              </p>
            </div>
            <Link
              href={`/payments/periods/${currentPeriod.Id}`}
              className="btn-primary"
            >
              Ver corte
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent payments */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-rapid-border flex justify-between items-center">
            <h2 className="text-sm font-semibold text-rapid-text">Pagos recientes</h2>
            <Link href="/payments/advances/new" className="text-xs font-medium text-rapid-green-dark hover:underline">
              + Anticipo
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="p-4 text-sm text-rapid-text-muted">Sin pagos registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.Id} className="table-row">
                    <td className="table-cell">
                      <p className="font-medium text-rapid-text">{employeeDisplayName(p.Employee)}</p>
                      <p className="text-[11px] text-rapid-text-muted">
                        {EMPLOYEE_PAYMENT_TYPE_LABELS[p.Type]} · {formatDate(p.PaymentDate)}
                      </p>
                    </td>
                    <td className="table-cell text-right font-mono font-medium tabular-nums">
                      {formatMoney(Number(p.Amount))}
                    </td>
                    <td className="table-cell text-right">
                      <Link
                        href={`/print/payments/${p.Id}`}
                        target="_blank"
                        className="text-xs text-rapid-green-dark hover:underline"
                      >
                        Imprimir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Period history */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-rapid-border">
            <h2 className="text-sm font-semibold text-rapid-text">Historial de quincenas</h2>
          </div>
          {periods.length === 0 ? (
            <p className="p-4 text-sm text-rapid-text-muted">Sin períodos.</p>
          ) : (
            <ul className="divide-y divide-rapid-hairline">
              {periods.slice(0, 8).map((per) => (
                <li key={per.Id} className="px-4 py-3 flex justify-between items-center hover:bg-rapid-surface-soft transition-colors">
                  <div>
                    <p className="text-sm font-medium text-rapid-text">{payrollPeriodLabel(per)}</p>
                    <p className="text-[11px] text-rapid-text-muted">
                      {PAYROLL_PERIOD_STATUS_LABELS[per.Status]} ·{" "}
                      {per._count.PayrollSettlement} empleado(s)
                    </p>
                  </div>
                  <Link
                    href={`/payments/periods/${per.Id}`}
                    className="text-xs font-medium text-rapid-green-dark hover:underline"
                  >
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
