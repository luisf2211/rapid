import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getEmployeeById,
  getEmployeePendingAdvances,
  getEmployeeLaborWorkLines,
} from "@/services/employees.service";
import { employeeDisplayName } from "@/lib/employee/display";
import { formatMoney } from "@/lib/formatters/money";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { EMPLOYEE_PAYMENT_TYPE_LABELS } from "@/lib/constants";
import { toPlainNumber } from "@/lib/serialize";
import {
  sumLaborOrderAmount,
  formatPieceCount,
} from "@/lib/labor-order/piece-count";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const [emp, pendingAdvances, workLines] = await Promise.all([
    getEmployeeById(id),
    getEmployeePendingAdvances(id),
    getEmployeeLaborWorkLines(id, 100),
  ]);
  if (!emp) notFound();

  const workTotal = workLines.reduce((acc, l) => acc + l.amount, 0);

  return (
    <>
      <PageHeader
        title={employeeDisplayName(emp)}
        subtitle={emp.Phone ?? "Sin teléfono"}
        actions={
          <>
            <Link href="/employees" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
            <Link href={`/employees/${id}/edit`} className="btn-primary">
              <Pencil className="w-4 h-4" /> Editar
            </Link>
            <Link href={`/payments/advances/new?employeeId=${id}`} className="btn-secondary">
              Anticipo
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 lg:col-span-2">
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase font-semibold text-rapid-text-muted">Rol</dt>
              <dd className="font-medium mt-0.5">{emp.Role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase font-semibold text-rapid-text-muted">Tarifa/pieza</dt>
              <dd className="font-medium mt-0.5 font-mono">
                {formatMoney(toPlainNumber(emp.DefaultUnitPrice) ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase font-semibold text-rapid-text-muted">Cédula</dt>
              <dd className="font-medium mt-0.5">{emp.NationalId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase font-semibold text-rapid-text-muted">Ingreso</dt>
              <dd className="font-medium mt-0.5">
                {emp.HiredAt ? formatDate(emp.HiredAt) : "—"}
              </dd>
            </div>
          </dl>
          {emp.Notes && (
            <p className="text-sm text-rapid-text-muted mt-4 border-t border-rapid-border pt-4">
              {emp.Notes}
            </p>
          )}
        </div>
        <div className="card p-5 space-y-4">
          <div>
            <p className="text-xs uppercase font-semibold text-rapid-text-muted">Anticipos pendientes</p>
            <p className="text-3xl font-bold text-amber-700 mt-1 font-mono">
              {formatMoney(pendingAdvances)}
            </p>
          </div>
          <div className="border-t border-rapid-border pt-4">
            <p className="text-xs uppercase font-semibold text-rapid-text-muted">Trabajo registrado</p>
            <p className="text-xl font-bold text-rapid-green-dark mt-1 font-mono">
              {formatMoney(workTotal)}
            </p>
            <p className="text-xs text-rapid-text-muted mt-0.5">
              {workLines.length} línea{workLines.length === 1 ? "" : "s"} en MO
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-rapid-border bg-rapid-bg/50">
            <h2 className="font-bold">Detalle de trabajo (OR / mano de obra)</h2>
            <p className="text-xs text-rapid-text-muted mt-0.5">
              Piezas registradas en órdenes de recepción vinculadas a este empleado.
            </p>
          </div>
          {workLines.length === 0 ? (
            <p className="p-5 text-sm text-rapid-text-muted">Sin MO registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-rapid-bg/30 text-xs uppercase text-rapid-text-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Orden</th>
                    <th className="px-4 py-2 text-left">Pieza</th>
                    <th className="px-4 py-2 text-left">Cliente / placa</th>
                    <th className="px-4 py-2 text-right">Cant.</th>
                    <th className="px-4 py-2 text-right">Precio</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rapid-border">
                  {workLines.map((line) => (
                    <tr key={line.laborOrderItemId}>
                      <td className="px-4 py-2 text-xs whitespace-nowrap">
                        {formatDate(line.workedAt)}
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          href={`/work-orders/${line.workOrderId}`}
                          className="font-mono text-xs font-semibold hover:underline block"
                        >
                          OR-{String(line.workOrderNumber).padStart(5, "0")}
                        </Link>
                        <Link
                          href={`/labor-orders/${line.laborOrderId}`}
                          className="font-mono text-xs text-rapid-text-muted hover:underline block"
                        >
                          MO-{String(line.laborOrderNumber ?? line.laborOrderId).padStart(5, "0")}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{line.partName}</td>
                      <td className="px-4 py-2 text-xs text-rapid-text-muted">
                        {line.customerName ?? "—"}
                        {line.plate && <div>{line.plate}</div>}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatPieceCount(line.quantity)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatMoney(line.unitPrice)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-rapid-green-dark">
                        {formatMoney(line.amount)}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {line.alreadyInAdvance ? (
                          <span className="text-amber-700 font-semibold">En anticipo</span>
                        ) : (
                          <span className="text-rapid-text-muted">Disponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-rapid-border bg-rapid-bg/50">
            <h2 className="font-bold">Mano de obra reciente</h2>
          </div>
          {emp.LaborOrder.length === 0 ? (
            <p className="p-5 text-sm text-rapid-text-muted">Sin MO registradas.</p>
          ) : (
            <ul className="divide-y divide-rapid-border">
              {emp.LaborOrder.map((lo) => (
                <li key={lo.id} className="px-5 py-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/labor-orders/${lo.id}`} className="font-mono text-xs font-semibold hover:underline">
                        MO-{String(lo.id).padStart(5, "0")}
                      </Link>
                      {lo.workOrder && (
                        <Link
                          href={`/work-orders/${lo.workOrder.id}`}
                          className="block font-mono text-xs text-rapid-text-muted hover:underline mt-0.5"
                        >
                          OR-{String(lo.workOrder.orderNumber).padStart(5, "0")}
                          {lo.workOrder.plate ? ` · ${lo.workOrder.plate}` : ""}
                        </Link>
                      )}
                      <p className="text-xs text-rapid-text-muted mt-0.5">
                        {formatDateTime(lo.createdAt)}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-rapid-green-dark">
                      {formatMoney(sumLaborOrderAmount(lo.items))}
                    </span>
                  </div>
                  {lo.items.length > 0 && (
                    <ul className="mt-2 text-xs text-rapid-text-muted space-y-0.5">
                      {lo.items.map((item) => (
                        <li key={item.id}>
                          {item.partName} · {formatPieceCount(Number(item.quantity ?? item.total ?? 0))} pz
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-rapid-border bg-rapid-bg/50">
            <h2 className="font-bold">Pagos recientes</h2>
          </div>
          {emp.EmployeePayment.length === 0 ? (
            <p className="p-5 text-sm text-rapid-text-muted">Sin pagos.</p>
          ) : (
            <ul className="divide-y divide-rapid-border">
              {emp.EmployeePayment.map((p) => (
                <li key={p.Id} className="px-5 py-3 flex justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {EMPLOYEE_PAYMENT_TYPE_LABELS[p.Type] ?? p.Type}
                    </p>
                    <p className="text-xs text-rapid-text-muted">
                      {formatDate(p.PaymentDate)} · ANT/PAG-{String(p.PaymentNumber).padStart(5, "0")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold">
                      {formatMoney(Number(p.Amount))}
                    </span>
                    <Link
                      href={`/print/payments/${p.Id}`}
                      target="_blank"
                      className="block text-xs text-rapid-green-dark hover:underline mt-0.5"
                    >
                      Imprimir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
