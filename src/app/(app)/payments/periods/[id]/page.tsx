import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getPayrollPeriodById,
  payrollPeriodLabel,
} from "@/services/payroll.service";
import { formatMoney } from "@/lib/formatters/money";
import {
  PAYROLL_PERIOD_STATUS_LABELS,
  PAYROLL_SETTLEMENT_STATUS_LABELS,
} from "@/lib/constants";
import { employeeDisplayName } from "@/lib/employee/display";
import {
  generatePayrollFormAction,
  paySettlementFormAction,
} from "@/app/(app)/employees/actions";
import { formatPieceCount } from "@/lib/labor-order/piece-count";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayrollPeriodPage({ params }: PageProps) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const period = await getPayrollPeriodById(id);
  if (!period) notFound();

  const canGenerate =
    period.Status === "OPEN" && period.PayrollSettlement.length === 0;

  return (
    <>
      <PageHeader
        title={`Quincena — ${payrollPeriodLabel(period)}`}
        subtitle={
          PAYROLL_PERIOD_STATUS_LABELS[period.Status] ?? period.Status
        }
        actions={
          <Link href="/payments" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />

      {canGenerate && (
        <form action={generatePayrollFormAction.bind(null, id)} className="card p-5 mb-4">
          <p className="text-sm text-rapid-text-muted mb-3">
            Genera las liquidaciones desde las órdenes de mano de obra del
            período (1–15 o 16–fin de mes).
          </p>
          <button type="submit" className="btn-primary">
            Generar corte quincenal
          </button>
        </form>
      )}

      {period.PayrollSettlement.length === 0 ? (
        <div className="card p-10 text-center text-sm text-rapid-text-muted">
          {period.Status === "OPEN"
            ? "Aún no se ha generado el corte para esta quincena."
            : "Sin liquidaciones en este período."}
        </div>
      ) : (
        <div className="space-y-4">
          {period.PayrollSettlement.map((s) => (
            <div key={s.Id} className="card overflow-hidden">
              <div className="px-5 py-4 bg-rapid-bg/50 border-b border-rapid-border flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold text-lg">
                    {employeeDisplayName(s.Employee)}
                  </p>
                  <p className="text-xs text-rapid-text-muted mt-0.5">
                    {PAYROLL_SETTLEMENT_STATUS_LABELS[s.Status] ?? s.Status} ·{" "}
                    {s.PayrollLine.length} línea(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rapid-green-dark font-mono">
                    {formatMoney(Number(s.NetAmount))}
                  </p>
                  <p className="text-xs text-rapid-text-muted">Neto a pagar</p>
                </div>
              </div>

              <div className="px-5 py-3 grid grid-cols-3 gap-4 text-sm border-b border-rapid-border">
                <div>
                  <p className="text-xs text-rapid-text-muted uppercase font-semibold">Bruto</p>
                  <p className="font-mono font-semibold">{formatMoney(Number(s.GrossAmount))}</p>
                </div>
                <div>
                  <p className="text-xs text-rapid-text-muted uppercase font-semibold">Anticipos</p>
                  <p className="font-mono font-semibold text-amber-700">
                    −{formatMoney(Number(s.AdvancesAmount))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-rapid-text-muted uppercase font-semibold">Ajustes</p>
                  <p className="font-mono font-semibold">
                    {formatMoney(Number(s.AdjustmentsAmount))}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-rapid-text-muted">
                    <tr>
                      <th className="text-left px-5 py-2">Detalle</th>
                      <th className="text-right px-5 py-2">Cant.</th>
                      <th className="text-right px-5 py-2">Precio</th>
                      <th className="text-right px-5 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.PayrollLine.map((line) => (
                      <tr key={line.Id} className="border-t border-rapid-border">
                        <td className="px-5 py-2">{line.Description}</td>
                        <td className="px-5 py-2 text-right tabular-nums">
                          {formatPieceCount(Number(line.Quantity))}
                        </td>
                        <td className="px-5 py-2 text-right font-mono">
                          {formatMoney(Number(line.UnitPrice))}
                        </td>
                        <td className="px-5 py-2 text-right font-mono font-semibold">
                          {formatMoney(Number(line.Amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 flex flex-wrap gap-2 border-t border-rapid-border">
                {s.Status === "PENDING" && (
                  <form action={paySettlementFormAction.bind(null, s.Id)}>
                    <button type="submit" className="btn-primary text-sm">
                      Registrar pago quincenal
                    </button>
                  </form>
                )}
                {s.EmployeePayment_EmployeePayment_PayrollSettlementIdToPayrollSettlement[0] && (
                  <Link
                    href={`/print/payments/${s.EmployeePayment_EmployeePayment_PayrollSettlementIdToPayrollSettlement[0].Id}?auto=1`}
                    target="_blank"
                    className="btn-secondary text-sm"
                  >
                    <Printer className="w-4 h-4" /> Imprimir comprobante
                  </Link>
                )}
                <Link
                  href={`/print/payments/settlements/${s.Id}`}
                  target="_blank"
                  className="btn-secondary text-sm"
                >
                  Vista previa liquidación
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
