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
import { QuotationWorkflowActions } from "@/components/quotation/QuotationWorkflowActions";
import { DeleteQuotationButton } from "@/components/quotation/DeleteQuotationButton";
import { PrintSelect, ShareSelect } from "@/components/quotation/QuotationActionSelects";
import {
  canDeleteQuotation,
  canEditQuotation,
} from "@/lib/quotation/form-mapper";

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
    <div className="space-y-5">
      {/* Breadcrumb */}
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
          {/* ─── Header bar ─────────────────────────────────────────────── */}
          <div className="card p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left: identity */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-semibold text-rapid-text">
                      #{quotation.quotationNumber}
                    </h1>
                    <QuotationStatusBadge status={quotation.status} />
                  </div>
                  <p className="text-sm text-rapid-text-muted mt-0.5 truncate">
                    {quotation.customerName}
                    <span className="mx-1.5 text-rapid-border">·</span>
                    {typeLabel}
                    {quotation.plate && (
                      <>
                        <span className="mx-1.5 text-rapid-border">·</span>
                        {quotation.plate}
                      </>
                    )}
                  </p>
                  {quotation.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">
                      {quotation.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: total */}
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <p className="text-2xl font-semibold tabular-nums text-rapid-text">
                    {formatMoney(toPlainNumber(quotation.grandTotal) ?? 0)}
                  </p>
                  <p className="text-[11px] text-rapid-text-muted">
                    {quotation.quotationType === "INSURANCE" ? "con ITBIS" : "total"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions integrated into header */}
            <div className="mt-4 pt-4 border-t border-rapid-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                {canEdit && (
                  <Link
                    href={`/quotations/${quotation.id}/edit`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Link>
                )}
                <PrintSelect
                  quotationId={quotation.id}
                  isInsurance={quotation.quotationType === "INSURANCE"}
                />
                <ShareSelect
                  phone={quotation.phone}
                  customerName={quotation.customerName}
                  printPath={`/print/quotations/${quotation.id}`}
                />
              </div>

              <QuotationWorkflowActions
                id={quotation.id}
                status={quotation.status}
                workOrderId={quotation.workOrderId}
                workOrderNumber={quotation.workOrder?.orderNumber}
              />
            </div>
          </div>

          {/* ─── Content grid ───────────────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Left column: details */}
            <div className="lg:col-span-2 space-y-5">
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
                  headers={["Pieza", "Cant.", "Total"]}
                  rows={quotation.partLines.map((p) => [
                    p.partName,
                    `${toPlainNumber(p.quantity)} u.`,
                    formatMoney(toPlainNumber(p.lineTotal) ?? 0),
                  ])}
                />
              )}

              {quotation.damages.length > 0 && (
                <div className="card p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">
                    Daños reportados
                  </h2>
                  <ul className="text-sm space-y-1.5">
                    {quotation.damages.map((d) => (
                      <li key={d.id} className="flex gap-2">
                        <span className="text-rapid-text-muted">•</span>
                        <span>
                          {labelFor(DAMAGE_SIDES, d.vehicleSide)} —{" "}
                          {labelFor(DAMAGE_TYPES, d.damageType)}
                          {d.description ? `: ${d.description}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
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
            </div>

            {/* Right column: sidebar info */}
            <div className="space-y-5">
              {/* Cliente */}
              <div className="card p-5 text-sm space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">
                  Cliente
                </h2>
                <p className="font-medium text-rapid-text">{quotation.customerName}</p>
                {quotation.phone && <p className="text-rapid-text-muted">{quotation.phone}</p>}
                {quotation.email && <p className="text-rapid-text-muted">{quotation.email}</p>}
                {quotation.nationalId && <p className="text-rapid-text-muted">ID: {quotation.nationalId}</p>}
              </div>

              {/* Vehículo */}
              <div className="card p-5 text-sm space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">
                  Vehículo
                </h2>
                <p className="font-medium text-rapid-text">
                  {[quotation.brand, quotation.model, quotation.vehicleYear]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
                {quotation.plate && <p className="text-rapid-text-muted">Placa: {quotation.plate}</p>}
                {quotation.color && <p className="text-rapid-text-muted">Color: {quotation.color}</p>}
                {quotation.vin && <p className="text-rapid-text-muted font-mono text-xs">VIN: {quotation.vin}</p>}
              </div>

              {/* Seguro */}
              {quotation.quotationType === "INSURANCE" && (
                <div className="card p-5 text-sm space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">
                    Aseguradora
                  </h2>
                  {quotation.insuranceCompany && (
                    <p className="font-medium text-rapid-text">{quotation.insuranceCompany}</p>
                  )}
                  {quotation.insurerRnc && (
                    <p className="text-rapid-text-muted">RNC: {quotation.insurerRnc}</p>
                  )}
                  {quotation.policyNumber && (
                    <p className="text-rapid-text-muted">Póliza: {quotation.policyNumber}</p>
                  )}
                  {quotation.claimNumber && (
                    <p className="text-rapid-text-muted">Reclamo: {quotation.claimNumber}</p>
                  )}
                  {quotation.adjusterName && (
                    <p className="text-rapid-text-muted">Ajustador: {quotation.adjusterName}</p>
                  )}
                  {toPlainNumber(quotation.deductibleAmount) != null &&
                    toPlainNumber(quotation.deductibleAmount)! > 0 && (
                      <p className="font-medium text-rapid-text">
                        Deducible: {formatMoney(toPlainNumber(quotation.deductibleAmount)!)}
                      </p>
                    )}
                </div>
              )}

              {/* Resumen financiero */}
              <div className="card p-5 text-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">
                  Resumen
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-rapid-text-muted">Mano de obra</span>
                    <span className="tabular-nums">
                      {formatMoney(
                        quotation.laborLines.reduce((s, l) => s + (toPlainNumber(l.lineTotal) ?? 0), 0),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rapid-text-muted">Repuestos</span>
                    <span className="tabular-nums">
                      {formatMoney(
                        quotation.partLines.reduce((s, p) => s + (toPlainNumber(p.lineTotal) ?? 0), 0),
                      )}
                    </span>
                  </div>
                  {toPlainNumber(quotation.discountAmount) != null &&
                    toPlainNumber(quotation.discountAmount)! > 0 && (
                      <div className="flex justify-between">
                        <span className="text-rapid-text-muted">Descuento</span>
                        <span className="tabular-nums text-rapid-text-muted">
                          -{formatMoney(toPlainNumber(quotation.discountAmount)!)}
                        </span>
                      </div>
                    )}
                  {toPlainNumber(quotation.taxAmount) != null &&
                    toPlainNumber(quotation.taxAmount)! > 0 && (
                      <div className="flex justify-between">
                        <span className="text-rapid-text-muted">ITBIS</span>
                        <span className="tabular-nums">
                          {formatMoney(toPlainNumber(quotation.taxAmount)!)}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between pt-2 border-t border-rapid-border">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold tabular-nums">
                      {formatMoney(toPlainNumber(quotation.grandTotal) ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {(quotation.termsNotes || quotation.internalNotes) && (
                <div className="card p-5 text-sm space-y-3">
                  {quotation.termsNotes && (
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-1">
                        Condiciones
                      </h2>
                      <p className="text-rapid-text-muted whitespace-pre-wrap leading-relaxed">
                        {quotation.termsNotes}
                      </p>
                    </div>
                  )}
                  {quotation.internalNotes && (
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-1">
                        Notas internas
                      </h2>
                      <p className="text-rapid-text-muted whitespace-pre-wrap leading-relaxed">
                        {quotation.internalNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── Delete zone (bottom, intentionally separated) ──────────── */}
          {canDelete && (
            <div className="pt-4 border-t border-rapid-border">
              <DeleteQuotationButton
                quotationId={quotation.id}
                quotationNumber={quotation.quotationNumber}
                customerName={quotation.customerName}
                className="px-3 py-2 rounded-lg text-sm text-rapid-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
              />
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
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-rapid-text-muted border-t border-rapid-border bg-rapid-surface-soft">
              <th className="text-left font-medium px-5 py-2.5">{headers[0]}</th>
              <th className="text-left font-medium px-5 py-2.5">{headers[1]}</th>
              <th className="text-right font-medium px-5 py-2.5">{headers[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-rapid-border">
                <td className="px-5 py-3">{row[0]}</td>
                <td className="px-5 py-3 text-rapid-text-muted">{row[1]}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">
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
