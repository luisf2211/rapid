import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Pencil, Printer } from "lucide-react";
import { canEditInvoice } from "@/services/invoices.service";
import { PageHeader } from "@/components/ui/PageHeader";
import { getInvoiceById } from "@/services/invoices.service";
import { InvoiceStatusBadge } from "@/components/invoice/InvoiceStatusBadge";
import { InvoiceDetailActions } from "@/components/invoice/InvoiceDetailActions";
import { formatMoney } from "@/lib/formatters/money";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { toPlainNumber } from "@/lib/serialize";
import { INVOICE_LINE_TYPE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const billingLabels: Record<string, string> = {
  PRIVATE: "Particular",
  INSURANCE: "Aseguradora",
};

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  const taxRate = toPlainNumber(invoice.taxRate) ?? 0;
  const showTax = taxRate > 0;
  const editable = canEditInvoice(invoice.status);

  return (
    <>
      <PageHeader
        title={`Factura FAC-${String(invoice.invoiceNumber).padStart(5, "0")}`}
        subtitle={`${invoice.customerName} · ${formatDate(invoice.invoiceDate)}`}
        badge={<InvoiceStatusBadge status={invoice.status} />}
        actions={
          <>
            <Link href="/invoices" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
            <Link
              href={`/work-orders/${invoice.workOrderId}`}
              className="btn-secondary"
            >
              <ClipboardList className="w-4 h-4" />
              Orden ORD-{String(invoice.workOrder.orderNumber).padStart(5, "0")}
            </Link>
            {editable && (
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="btn-primary"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Link>
            )}
            <Link
              href={`/print/invoices/${invoice.id}`}
              target="_blank"
              className="btn-secondary"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Link>
          </>
        }
      />

      <div className="mb-4">
        <InvoiceDetailActions invoiceId={invoice.id} status={invoice.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 lg:col-span-2 space-y-3 text-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted mb-2">
                Cliente
              </p>
              <p className="font-medium">{invoice.customerName}</p>
              {invoice.phone && <p className="text-rapid-text-muted">{invoice.phone}</p>}
              {invoice.nationalId && (
                <p className="text-rapid-text-muted">Cédula: {invoice.nationalId}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted mb-2">
                Vehículo
              </p>
              <p className="font-medium">
                {[invoice.brand, invoice.model, invoice.vehicleYear]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              {invoice.plate && (
                <p className="font-mono text-xs mt-1">{invoice.plate}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-rapid-text-muted">
            Tipo: {billingLabels[invoice.billingType] ?? invoice.billingType}
            {invoice.quotation && (
              <>
                {" "}
                · Cotización PRE/COT #
                {invoice.quotation.quotationNumber}
              </>
            )}
          </p>
          {invoice.notes && (
            <p className="text-sm text-rapid-text-muted border-t pt-3">
              {invoice.notes}
            </p>
          )}
        </div>

        <div className="surface-dark p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
            Total factura
          </p>
          <p className="text-3xl font-bold mt-2 text-rapid-green">
            {formatMoney(toPlainNumber(invoice.grandTotal) ?? 0)}
          </p>
          <div className="mt-4 space-y-1.5 text-xs text-white/70">
            <Row label="Mano de obra" value={invoice.laborSubtotal} />
            {(toPlainNumber(invoice.materialSubtotal) ?? 0) > 0 && (
              <Row label="Materiales" value={invoice.materialSubtotal} />
            )}
            {(toPlainNumber(invoice.discountAmount) ?? 0) > 0 && (
              <Row label="Descuento" value={invoice.discountAmount} negative />
            )}
            {showTax && <Row label={`ITBIS (${(taxRate * 100).toFixed(0)}%)`} value={invoice.taxAmount} />}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-rapid-surface/50 text-xs uppercase text-rapid-text-muted">
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-right">Cant.</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id} className="border-b border-rapid-border/60">
                <td className="px-4 py-3 text-xs text-rapid-text-muted">
                  {INVOICE_LINE_TYPE_LABELS[line.lineType] ?? line.lineType}
                </td>
                <td className="px-4 py-3">{line.description}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {toPlainNumber(line.quantity)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatMoney(toPlainNumber(line.unitPrice) ?? 0)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {formatMoney(toPlainNumber(line.lineTotal) ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(invoice.paidAt || invoice.voidedAt) && (
        <div className="card p-4 mt-4 text-sm text-rapid-text-muted">
          {invoice.paidAt && (
            <p>
              Pagada el {formatDateTime(invoice.paidAt)}
              {invoice.paymentReference && ` · Ref: ${invoice.paymentReference}`}
            </p>
          )}
          {invoice.voidedAt && (
            <p className="text-red-800">
              Anulada el {formatDateTime(invoice.voidedAt)}
              {invoice.voidReason && ` — ${invoice.voidReason}`}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Row({
  label,
  value,
  negative,
}: {
  label: string;
  value: unknown;
  negative?: boolean;
}) {
  const n = toPlainNumber(value) ?? 0;
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={`font-mono text-white ${negative ? "text-amber-300" : ""}`}>
        {negative ? "−" : ""}
        {formatMoney(n)}
      </span>
    </div>
  );
}
