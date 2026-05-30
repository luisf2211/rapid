import {
  DAMAGE_SIDES,
  DAMAGE_TYPES,
  QUOTATION_LABOR_AREAS,
} from "@/lib/constants";
import { formatDate } from "@/lib/formatters/date";
import { toPlainNumber } from "@/lib/serialize";
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
  photos: Array<{ url: string; description: string | null }>;
  conditions: string[];
};

export function buildQuotationPrintData(
  q: QuotationRow,
  workshop: WorkshopPrintInfo,
): QuotationPrintData {
  const isInsurance = q.quotationType === "INSURANCE";

  const laborRows = q.laborLines.map((l) => ({
    area: labelFor(QUOTATION_LABOR_AREAS, l.area),
    description: l.description ?? "",
    hours: toPlainNumber(l.estimatedHours),
    rate: toPlainNumber(l.hourlyRate),
    total: toPlainNumber(l.lineTotal) ?? 0,
  }));

  const materialRows = q.materialLines.map((m) => ({
    name: m.productName,
    quantity: toPlainNumber(m.quantity) ?? 0,
    unit: m.unit,
    unitPrice: toPlainNumber(m.unitPrice) ?? 0,
    total: toPlainNumber(m.lineTotal) ?? 0,
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
    ...materialRows.map((m) => ({
      concept: m.name,
      quantity: m.quantity,
      unitPrice: m.unitPrice,
      total: m.total,
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
  if (q.warrantyNotes?.trim()) {
    defaultConditions.push(`Garantía: ${q.warrantyNotes.trim()}`);
  } else {
    defaultConditions.push(
      "Garantía: 6 meses en pintura y 3 meses en carrocería (según política del taller).",
    );
  }
  defaultConditions.push(
    "Forma de pago: 50% anticipo al aprobar; saldo contra entrega.",
  );
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
    laborSubtotal: toPlainNumber(q.laborSubtotal) ?? 0,
    materialSubtotal: toPlainNumber(q.materialSubtotal) ?? 0,
    partsSubtotal: toPlainNumber(q.partsSubtotal) ?? 0,
    discountAmount: toPlainNumber(q.discountAmount) ?? 0,
    taxRate: toPlainNumber(q.taxRate) ?? 0.18,
    taxAmount: toPlainNumber(q.taxAmount) ?? 0,
    grandTotal: toPlainNumber(q.grandTotal) ?? 0,
    estimatedDays: q.estimatedDays,
    warrantyNotes: q.warrantyNotes,
    termsNotes: q.termsNotes,
    workLines,
    laborRows,
    materialRows,
    partRows,
    damageRows,
    photos,
    conditions,
  };
}
