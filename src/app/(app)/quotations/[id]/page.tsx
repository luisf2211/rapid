import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { QuotationStatusBadge } from "@/components/ui/QuotationStatusBadge";
import { getQuotationById } from "@/services/quotations.service";
import { formatMoney } from "@/lib/formatters/money";
import {
  quotationLaborAreaLabel,
  QUOTATION_TYPES,
  DAMAGE_SIDES,
  DAMAGE_TYPES,
} from "@/lib/constants";
import { toPlainNumber } from "@/lib/serialize";
import { QuotationPhotosSection } from "./QuotationPhotosSection";
import { PrintQuotationButton } from "@/components/quotation/PrintQuotationButton";
import { DeleteQuotationButton } from "@/components/quotation/DeleteQuotationButton";
import { QuotationWorkflowActions } from "@/components/quotation/QuotationWorkflowActions";
import {
  canDeleteQuotation,
  canEditQuotation,
} from "@/lib/quotation/form-mapper";
import { ShareButtons } from "@/components/ui/ShareButtons";

export const dynamic = "force-dynamic";

function labelFor<T extends { value: string; label: string }>(
  list: readonly T[],
  value: string | null | undefined,
) {
  if (!value) return "—";
  return list.find((x) => x.value === value)?.label ?? value;
}

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  let quotation: Awaited<ReturnType<typeof getQuotationById>> = null;
  let error: string | null = null;
  try {
    quotation = await getQuotationById(id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  if (!error && !quotation) notFound();

  const typeLabel = labelFor(QUOTATION_TYPES, quotation?.quotationType);
  const canEdit = quotation ? canEditQuotation(quotation.status) : false;
  const canDelete = quotation
    ? canDeleteQuotation(quotation.status, quotation.workOrderId)
    : false;

  return (
    <div className="space-y-4 max-w-4xl">
      <Link
        href="/quotations"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-rapid-text-muted hover:text-rapid-text transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Cotizaciones
      </Link>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {quotation && (
        <>
          <div className="card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-semibold text-rapid-text">
                    #{quotation.quotationNumber}
                  </h1>
                  <QuotationStatusBadge status={quotation.status} />
                </div>
                <p className="text-sm font-medium text-rapid-text truncate">
                  {quotation.customerName}
                </p>
                <p className="text-xs text-rapid-text-muted mt-0.5">
                  {typeLabel}
                  {quotation.plate ? ` · ${quotation.plate}` : ""}
                </p>
                {quotation.rejectionReason && (
                  <p className="text-xs text-red-600 mt-2">
                    {quotation.rejectionReason}
                  </p>
                )}
              </div>
              <div className="sm:text-right shrink-0">
                <p className="text-2xl font-semibold tabular-nums text-rapid-text">
                  {formatMoney(toPlainNumber(quotation.grandTotal) ?? 0)}
                </p>
                <p className="text-[11px] text-rapid-text-muted">
                  {quotation.quotationType === "INSURANCE" ? "con ITBIS" : "total"}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-rapid-hairline space-y-4">
              <QuotationWorkflowActions
                id={quotation.id}
                status={quotation.status}
                workOrderId={quotation.workOrderId}
                workOrderNumber={quotation.workOrder?.orderNumber}
              />

              <div className="flex flex-wrap items-center gap-2">
                {canEdit && (
                  <Link
                    href={`/quotations/${quotation.id}/edit`}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Link>
                )}
                <PrintQuotationButton quotationId={quotation.id} quotationType={quotation.quotationType} />
                <ShareButtons
                  documentType="cotización"
                  documentNumber={`COT-${String(quotation.quotationNumber).padStart(5, "0")}`}
                  customerName={quotation.customerName}
                  phone={quotation.phone}
                  email={quotation.email}
                  printPath={`/print/quotations/${quotation.id}`}
                />
                {canDelete && (
                  <DeleteQuotationButton
                    quotationId={quotation.id}
                    quotationNumber={quotation.quotationNumber}
                    customerName={quotation.customerName}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4 text-sm space-y-1.5">
              <h2 className="text-xs font-medium text-rapid-text-muted mb-2">
                Cliente
              </h2>
              <p className="font-medium">{quotation.customerName}</p>
              {quotation.phone && <p>{quotation.phone}</p>}
              {quotation.email && <p className="text-rapid-text-muted">{quotation.email}</p>}
              {quotation.quotationType === "INSURANCE" && (
                <div className="pt-2 mt-2 border-t border-rapid-hairline space-y-1">
                  {quotation.insuranceCompany && (
                    <p className="font-medium">{quotation.insuranceCompany}</p>
                  )}
                  {quotation.insurerRnc && (
                    <p className="text-rapid-text-muted">RNC: {quotation.insurerRnc}</p>
                  )}
                  {quotation.policyNumber && (
                    <p>Póliza {quotation.policyNumber}</p>
                  )}
                  {quotation.claimNumber && (
                    <p className="text-rapid-text-muted">
                      Reclamo {quotation.claimNumber}
                    </p>
                  )}
                  {toPlainNumber(quotation.deductibleAmount) != null &&
                    toPlainNumber(quotation.deductibleAmount)! > 0 && (
                      <p>
                        Deducible:{" "}
                        <span className="font-semibold text-rapid-text">
                          {formatMoney(toPlainNumber(quotation.deductibleAmount)!)}
                        </span>
                      </p>
                    )}
                </div>
              )}
            </div>
            <div className="card p-4 text-sm space-y-1.5">
              <h2 className="text-xs font-medium text-rapid-text-muted mb-2">
                Vehículo
              </h2>
              <p className="font-medium">
                {[quotation.brand, quotation.model, quotation.vehicleYear]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </p>
              {quotation.plate && <p>Placa {quotation.plate}</p>}
              {quotation.color && (
                <p className="text-rapid-text-muted">{quotation.color}</p>
              )}
            </div>
          </div>

          {quotation.laborLines.length > 0 && (
            <LineTable
              title="Mano de obra"
              headers={["Tarea", "Detalle", "Total"]}
              rows={quotation.laborLines.map((l) => [
                quotationLaborAreaLabel(l.area),
                l.description || "—",
                formatMoney(toPlainNumber(l.lineTotal) ?? 0),
              ])}
            />
          )}

          {quotation.partLines.length > 0 && (
            <LineTable
              title="Repuestos"
              headers={["Pieza", "", "Total"]}
              rows={quotation.partLines.map((p) => [
                p.partName,
                `${toPlainNumber(p.quantity)} u.`,
                formatMoney(toPlainNumber(p.lineTotal) ?? 0),
              ])}
            />
          )}

          <QuotationPhotosSection
            quotationId={quotation.id}
            photos={quotation.photos.map((p) => ({
              id: p.id,
              photoUrl: p.photoUrl,
              category: p.category,
              description: p.description,
            }))}
            editable={
              quotation.status === "DRAFT" ||
              quotation.status === "PENDING" ||
              quotation.status === "APPROVED"
            }
          />

          {quotation.damages.length > 0 && (
            <div className="card p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-2">
                Daños
              </h2>
              <ul className="text-sm space-y-1">
                {quotation.damages.map((d) => (
                  <li key={d.id}>
                    {labelFor(DAMAGE_SIDES, d.vehicleSide)} —{" "}
                    {labelFor(DAMAGE_TYPES, d.damageType)}
                    {d.description ? `: ${d.description}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(quotation.termsNotes || quotation.internalNotes) && (
            <div className="card p-4 text-sm space-y-3">
              {quotation.termsNotes && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-1">
                    Condiciones
                  </h2>
                  <p className="text-rapid-text-muted whitespace-pre-wrap">
                    {quotation.termsNotes}
                  </p>
                </div>
              )}
              {quotation.internalNotes && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-1">
                    Notas internas
                  </h2>
                  <p className="text-rapid-text-muted whitespace-pre-wrap">
                    {quotation.internalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LineTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: [string, string, string];
  rows: [string, string, string][];
}) {
  return (
    <div className="card overflow-hidden">
      <h2 className="text-xs font-medium text-rapid-text-muted px-4 pt-4 pb-2">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-rapid-text-muted text-left border-t border-rapid-border">
              <th className="px-4 py-2 font-medium">{headers[0]}</th>
              <th className="px-4 py-2 font-medium">{headers[1]}</th>
              <th className="px-4 py-2 font-medium text-right">{headers[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-rapid-border">
                <td className="px-4 py-2.5">{row[0]}</td>
                <td className="px-4 py-2.5 text-rapid-text-muted">{row[1]}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                  {row[2]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
