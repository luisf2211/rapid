import Link from "next/link";
import { Plus, Wallet, CalendarRange } from "lucide-react";
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
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {currentPeriod && (
        <div className="surface-dark p-5 mb-4">
          <p className="text-xs uppercase tracking-wider on-dark-label font-semibold">
            Quincena en curso
          </p>
          <p className="text-xl font-bold mt-1">
            {payrollPeriodLabel(currentPeriod)}
          </p>
          <p className="text-sm on-dark-muted mt-2">
            Estado:{" "}
            {PAYROLL_PERIOD_STATUS_LABELS[currentPeriod.Status] ?? currentPeriod.Status}
          </p>
          <Link
            href={`/payments/periods/${currentPeriod.Id}`}
            className="btn-primary mt-4 inline-flex text-sm"
          >
            Ver corte quincenal
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-rapid-border flex justify-between items-center">
            <h2 className="font-bold">Pagos recientes</h2>
            <Link href="/payments/advances/new" className="text-xs font-semibold text-rapid-green-dark">
              <Plus className="w-3.5 h-3.5 inline" /> Anticipo
            </Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="p-5 text-sm text-rapid-text-muted">Sin pagos registrados.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.Id} className="border-t border-rapid-border">
                    <td className="px-5 py-3">
                      <p className="font-medium">{employeeDisplayName(p.Employee)}</p>
                      <p className="text-xs text-rapid-text-muted">
                        {EMPLOYEE_PAYMENT_TYPE_LABELS[p.Type]} · {formatDate(p.PaymentDate)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {formatMoney(Number(p.Amount))}
                    </td>
                    <td className="px-5 py-3 text-right">
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

        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-rapid-border">
            <h2 className="font-bold">Historial de quincenas</h2>
          </div>
          {periods.length === 0 ? (
            <p className="p-5 text-sm text-rapid-text-muted">Sin períodos.</p>
          ) : (
            <ul className="divide-y divide-rapid-border">
              {periods.slice(0, 8).map((per) => (
                <li key={per.Id} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{payrollPeriodLabel(per)}</p>
                    <p className="text-xs text-rapid-text-muted">
                      {PAYROLL_PERIOD_STATUS_LABELS[per.Status]} ·{" "}
                      {per._count.PayrollSettlement} empleado(s)
                    </p>
                  </div>
                  <Link
                    href={`/payments/periods/${per.Id}`}
                    className="text-xs font-semibold text-rapid-green-dark hover:underline"
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
