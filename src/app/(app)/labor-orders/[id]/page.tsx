import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Pencil, Printer } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLaborOrderById } from "@/services/labor-orders.service";
import { getLatestInvoiceForWorkOrder } from "@/services/invoices.service";
import { canEditLaborOrder } from "@/lib/labor-order/can-edit";
import { laborOrderWorkerName } from "@/lib/labor-order/worker-name";
import { formatMoney } from "@/lib/formatters/money";
import { formatDateTime } from "@/lib/formatters/date";
import {
  formatPieceCount,
  laborItemLineAmount,
  laborItemQuantity,
  laborItemUnitPrice,
  sumLaborOrderAmount,
  sumLaborOrderPieces,
} from "@/lib/labor-order/piece-count";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LaborOrderDetailPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const lo = await getLaborOrderById(id);
  if (!lo) notFound();

  const invoice = await getLatestInvoiceForWorkOrder(lo.workOrderId);
  const editable = canEditLaborOrder(invoice?.status);
  const worker = laborOrderWorkerName(lo);
  const wo = lo.workOrder;
  const totalPieces = sumLaborOrderPieces(lo.items);
  const totalAmount = sumLaborOrderAmount(lo.items);

  return (
    <>
      <PageHeader
        title={`Mano de obra MO-${String(lo.id).padStart(5, "0")}`}
        subtitle={`${worker} · ${formatDateTime(lo.createdAt)}`}
        actions={
          <>
            <Link href="/labor-orders" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
            <Link
              href={`/work-orders/${lo.workOrderId}`}
              className="btn-secondary"
            >
              <ClipboardList className="w-4 h-4" />
              Orden #{String(wo.orderNumber).padStart(5, "0")}
            </Link>
            {editable && (
              <Link
                href={`/labor-orders/${lo.id}/edit`}
                className="btn-primary"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Link>
            )}
            <Link
              href={`/print/labor-orders/${lo.id}`}
              target="_blank"
              className="btn-secondary"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Link>
          </>
        }
      />

      {invoice && !editable && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-900">
          Esta orden tiene una factura{" "}
          <span className="font-semibold">
            {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
          </span>{" "}
          y la mano de
          obra ya no se puede modificar. Si necesitas corregir montos, anula o
          ajusta la factura según tu proceso.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold text-lg mb-3">Resumen</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-rapid-text-muted text-xs uppercase tracking-wider font-semibold">
                Técnico
              </dt>
              <dd className="font-medium mt-0.5">{worker}</dd>
            </div>
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
                Registrado
              </dt>
              <dd className="font-medium mt-0.5">
                {formatDateTime(lo.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
        <div className="card p-5 flex flex-col justify-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Total piezas
            </p>
            <p className="text-3xl font-bold text-rapid-text tabular-nums mt-1">
              {formatPieceCount(totalPieces)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Total a pagar
            </p>
            <p className="text-3xl font-bold text-rapid-green-dark tabular-nums mt-1">
              {formatMoney(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-rapid-border bg-rapid-bg/50">
          <h2 className="font-bold text-lg">Piezas trabajadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-rapid-text-muted">
              <tr>
                <th className="text-left font-semibold px-5 py-3">
                  Pieza
                </th>
                <th className="text-right font-semibold px-5 py-3">
                  Cantidad
                </th>
                <th className="text-right font-semibold px-5 py-3">
                  Precio/pieza
                </th>
                <th className="text-right font-semibold px-5 py-3">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lo.items.map((it) => (
                <tr key={it.id} className="border-t border-rapid-border">
                  <td className="px-5 py-3 font-medium">{it.partName}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {formatPieceCount(laborItemQuantity(it))}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {formatMoney(laborItemUnitPrice(it))}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold">
                    {formatMoney(laborItemLineAmount(it))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-rapid-border bg-rapid-bg/30">
                <td className="px-5 py-3 text-right font-semibold text-rapid-text-muted">
                  Totales
                </td>
                <td className="px-5 py-3 text-right font-bold tabular-nums">
                  {formatPieceCount(totalPieces)}
                </td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-right font-bold text-rapid-green-dark tabular-nums">
                  {formatMoney(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
