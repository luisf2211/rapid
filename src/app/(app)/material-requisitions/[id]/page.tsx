import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Printer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMaterialRequisitionById } from "@/services/material-requisitions.service";
import { formatMoney } from "@/lib/formatters/money";
import { formatDateTime } from "@/lib/formatters/date";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { splitRequisitionItems } from "@/lib/material-requisition/line-type";
import { toPlainNumber } from "@/lib/serialize";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function RequisitionDetailTable({
  title,
  items,
}: {
  title: string;
  items: NonNullable<Awaited<ReturnType<typeof getMaterialRequisitionById>>>["items"];
}) {
  if (!items || items.length === 0) return null;
  const subtotal = items.reduce(
    (acc, it) => acc + (toPlainNumber(it.total) ?? 0),
    0,
  );

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-rapid-border bg-rapid-bg/50 flex items-center justify-between">
        <h2 className="font-bold text-lg">{title}</h2>
        <p className="text-sm font-semibold text-rapid-green-dark tabular-nums">
          {formatMoney(subtotal)}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-rapid-text-muted">
            <tr>
              <th className="text-left font-semibold px-5 py-3">Producto</th>
              <th className="text-right font-semibold px-5 py-3">Cant.</th>
              <th className="text-right font-semibold px-5 py-3">Precio</th>
              <th className="text-right font-semibold px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-rapid-border">
                <td className="px-5 py-3">
                  <p className="font-medium">{it.productName}</p>
                  {it.assignedEmployee && (
                    <p className="text-xs text-rapid-text-muted mt-0.5">
                      Asignado: {it.assignedEmployee}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {formatFractionQuantity(toPlainNumber(it.quantity) ?? 1)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {formatMoney(toPlainNumber(it.unitPrice) ?? 0)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-semibold text-rapid-green-dark">
                  {formatMoney(toPlainNumber(it.total) ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function MaterialRequisitionDetailPage({
  params,
}: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const req = await getMaterialRequisitionById(id);
  if (!req) notFound();

  const wo = req.workOrder;
  const { materialItems, paintItems } = splitRequisitionItems(req.items);

  return (
    <>
      <PageHeader
        title={`Requisición RM-${String(req.id).padStart(5, "0")}`}
        subtitle={`${wo.customerName ?? "—"} · ${formatDateTime(req.createdAt)}`}
        actions={
          <>
            <Link href="/material-requisitions" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
            <Link
              href={`/work-orders/${req.workOrderId}`}
              className="btn-secondary"
            >
              <ClipboardList className="w-4 h-4" />
              Orden #{String(wo.orderNumber).padStart(5, "0")}
            </Link>
            <Link
              href={`/print/material-requisitions/${req.id}`}
              target="_blank"
              className="btn-secondary"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold text-lg mb-3">Resumen</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-rapid-text-muted text-xs uppercase tracking-wider font-semibold">
                Cliente
              </dt>
              <dd className="font-medium mt-0.5">{wo.customerName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-rapid-text-muted text-xs uppercase tracking-wider font-semibold">
                Vehículo
              </dt>
              <dd className="font-medium mt-0.5">
                {wo.brand} {wo.model}{" "}
                <span className="font-mono text-xs text-rapid-text-muted">
                  ({wo.plate ?? "—"})
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-rapid-text-muted text-xs uppercase tracking-wider font-semibold">
                Orden de recepción
              </dt>
              <dd className="font-medium mt-0.5 font-mono">
                ORD-{String(wo.orderNumber).padStart(5, "0")}
              </dd>
            </div>
            <div>
              <dt className="text-rapid-text-muted text-xs uppercase tracking-wider font-semibold">
                Registrada
              </dt>
              <dd className="font-medium mt-0.5">
                {formatDateTime(req.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
        <div className="card p-5 flex flex-col justify-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Materiales
            </p>
            <p className="text-2xl font-bold text-rapid-green-dark tabular-nums mt-1">
              {formatMoney(
                materialItems.reduce(
                  (acc, it) => acc + (toPlainNumber(it.total) ?? 0),
                  0,
                ),
              )}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Pintura
            </p>
            <p className="text-2xl font-bold text-rapid-green-dark tabular-nums mt-1">
              {formatMoney(
                paintItems.reduce(
                  (acc, it) => acc + (toPlainNumber(it.total) ?? 0),
                  0,
                ),
              )}
            </p>
          </div>
          <div className="pt-2 border-t border-rapid-border">
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Total
            </p>
            <p className="text-3xl font-bold text-rapid-green-dark tabular-nums mt-1">
              {formatMoney(Number(req.total ?? 0))}
            </p>
            <p className="text-xs text-rapid-text-muted mt-1">
              {req.items.length} línea(s)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <RequisitionDetailTable title="Materiales" items={materialItems} />
        <RequisitionDetailTable title="Pintura" items={paintItems} />
      </div>
    </>
  );
}
