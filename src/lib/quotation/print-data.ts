import { formatDate } from "@/lib/formatters/date";
import { toPlainNumber } from "@/lib/serialize";
import { computeQuotationTotals } from "@/lib/quotation/totals";
import { DAMAGE_SIDES, DAMAGE_TYPES, quotationLaborAreaLabel } from "@/lib/constants";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import type { getQuotationById } from "@/services/quotations.service";

type QuotationRow = NonNullable<Awaited<ReturnType<typeof getQuotationById>>>;

function labelFor<T extends { value: string; label: string }>(
  list: readonly T[],
  value: string | null | undefined,
) {
  if (!value) return "";
  return list.find((x) => x.value === value)?.label ?? value;
}

export function formatDocNumber(
  type: string,
  quotationNumber: number,
): string {
  const n = String(quotationNumber).padStart(6, "0");
  return type === "INSURANCE" ? `PRE-${n}` : `COT-${n}`;
}

export type WorkLine = {
  concept: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type QuotationPrintData = {
  id: number;
  quotationType: string;
  docNumber: string;
  docTitle: string;
  quotationDate: string;
  validUntil: string | null;
  customerName: string;
  phone: string | null;
  email: string | null;
  nationalId: string | null;
  address: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  color: string | null;
  plate: string | null;
  vin: string | null;
  mileage: string | null;
  insuranceCompany: string | null;
  policyNumber: string | null;
  claimNumber: string | null;
  adjusterName: string | null;
  adjusterPhone: string | null;
  deductibleAmount: number | null;
  laborSubtotal: number;
  materialSubtotal: number;
  partsSubtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  estimatedDays: number | null;
  warrantyNotes: string | null;
  termsNotes: string | null;
  workLines: WorkLine[];
  laborRows: Array<{
    area: string;
    description: string;
    hours: number | null;
    rate: number | null;
    total: number;
  }>;
  materialRows: Array<{
    name: string;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    total: number;
  }>;
  partRows: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  damageRows: Array<{
    partName: string;
    operation: string;
    workType: string;
    hours: string;
  }>;
  /** Fotos solo para vista digital; no se usan en impresión. */
  photos: Array<{ url: string; description: string | null }>;
  conditions: string[];
};

export function buildQuotationPrintData(
  q: QuotationRow,
  workshop: WorkshopPrintInfo,
): QuotationPrintData {
  const isInsurance = q.quotationType === "INSURANCE";

  const laborRows = q.laborLines.map((l) => ({
    area: quotationLaborAreaLabel(l.area),
    description: l.description ?? "",
    hours: toPlainNumber(l.estimatedHours),
    rate: toPlainNumber(l.hourlyRate),
    total: toPlainNumber(l.lineTotal) ?? 0,
  }));

  const partRows = q.partLines.map((p) => ({
    name: p.partName,
    description: p.description ?? "",
    quantity: toPlainNumber(p.quantity) ?? 0,
    unitPrice: toPlainNumber(p.unitPrice) ?? 0,
    total: toPlainNumber(p.lineTotal) ?? 0,
  }));

  const workLines: WorkLine[] = [
    ...laborRows.map((l) => ({
      concept: [l.area, l.description].filter(Boolean).join(" — ") || l.area,
      quantity: 1,
      unitPrice: l.total,
      total: l.total,
    })),
    ...partRows.map((p) => ({
      concept: p.description ? `${p.name} (${p.description})` : p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.total,
    })),
  ];

  const damageRows = q.damages.map((d) => ({
    partName: d.partName ?? labelFor(DAMAGE_SIDES, d.vehicleSide) ?? "—",
    operation: labelFor(DAMAGE_TYPES, d.damageType) || d.damageType || "—",
    workType: d.description ?? "—",
    hours: "—",
  }));

  const defaultConditions: string[] = [];
  if (q.estimatedDays) {
    defaultConditions.push(
      `Tiempo de entrega estimado: ${q.estimatedDays} días hábiles.`,
    );
  }
  const warrantyText =
    workshop.quotationWarrantyNotes?.trim() || q.warrantyNotes?.trim() || null;
  if (warrantyText) {
    defaultConditions.push(
      warrantyText.toLowerCase().startsWith("garantía")
        ? warrantyText
        : `Garantía: ${warrantyText}`,
    );
  }
  const paymentText = workshop.quotationPaymentNotes?.trim() || null;
  if (paymentText) {
    defaultConditions.push(
      paymentText.toLowerCase().startsWith("forma de pago")
        ? paymentText
        : `Forma de pago: ${paymentText}`,
    );
  }
  if (workshop.quotationFooter?.trim()) {
    defaultConditions.push(workshop.quotationFooter.trim());
  }

  const conditions = q.termsNotes?.trim()
    ? q.termsNotes.trim().split(/\n+/).filter(Boolean)
    : defaultConditions;

  const photos = (q.photos ?? []).map((p) => ({
    url: p.photoUrl,
    description: p.description,
  }));

  const discountAmount = toPlainNumber(q.discountAmount) ?? 0;
  const taxRate = toPlainNumber(q.taxRate) ?? 0.18;
  const laborSubtotal = laborRows.reduce((s, l) => s + l.total, 0);
  const partsSubtotal = partRows.reduce((s, p) => s + p.total, 0);
  const materialSubtotal = 0;
  const totals = computeQuotationTotals({
    laborLines: laborRows.map((l) => ({ lineTotal: l.total })),
    materialLines: [],
    partLines: partRows.map((p) => ({ lineTotal: p.total })),
    discountAmount,
    taxRate,
  });

  return {
    id: q.id,
    quotationType: q.quotationType,
    docNumber: formatDocNumber(q.quotationType, q.quotationNumber),
    docTitle: isInsurance ? "PRESUPUESTO PARA ASEGURADORA" : "COTIZACIÓN",
    quotationDate: formatDate(q.quotationDate),
    validUntil: q.validUntil ? formatDate(q.validUntil) : null,
    customerName: q.customerName,
    phone: q.phone,
    email: q.email,
    nationalId: q.nationalId,
    address: q.address,
    brand: q.brand,
    model: q.model,
    vehicleYear: q.vehicleYear,
    color: q.color,
    plate: q.plate,
    vin: q.vin,
    mileage: q.mileage,
    insuranceCompany: q.insuranceCompany,
    policyNumber: q.policyNumber,
    claimNumber: q.claimNumber,
    adjusterName: q.adjusterName,
    adjusterPhone: q.adjusterPhone,
    deductibleAmount: toPlainNumber(q.deductibleAmount),
    laborSubtotal,
    materialSubtotal,
    partsSubtotal,
    discountAmount,
    taxRate,
    taxAmount: totals.taxAmount,
    grandTotal: totals.grandTotal,
    estimatedDays: q.estimatedDays,
    warrantyNotes: warrantyText,
    termsNotes: q.termsNotes,
    workLines,
    laborRows,
    materialRows: [],
    partRows,
    damageRows,
    photos,
    conditions,
  };
}
