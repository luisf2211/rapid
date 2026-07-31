import { toDateInputValue } from "@/lib/formatters/date";
import { toPlainNumber } from "@/lib/serialize";
import type { QuotationFormValues } from "@/lib/validations/quotation";
import type { getQuotationById } from "@/services/quotations.service";

type QuotationDetail = NonNullable<Awaited<ReturnType<typeof getQuotationById>>>;

export function canEditQuotation(_status: string): boolean {
  return true;
}

export function canDeleteQuotation(
  status: string,
  workOrderId: number | null | undefined,
): boolean {
  return status !== "CONVERTED" && !workOrderId;
}

export function quotationToFormValues(q: QuotationDetail): QuotationFormValues {
  return {
    quotationType: q.quotationType as "PRIVATE" | "INSURANCE",
    submitStatus:
      q.status === "PENDING" ? "PENDING" : "DRAFT",
    validUntil: toDateInputValue(q.validUntil),
    customerName: q.customerName,
    phone: q.phone ?? "",
    email: q.email ?? "",
    nationalId: q.nationalId ?? "",
    address: q.address ?? "",
    brand: q.brand ?? "",
    model: q.model ?? "",
    vehicleYear: q.vehicleYear ?? undefined,
    color: q.color ?? "",
    plate: q.plate ?? "",
    vin: q.vin ?? "",
    mileage: q.mileage ?? "",
    mileageUnit: (q.mileageUnit as "km" | "mi") ?? "mi",
    insuranceCompany: q.insuranceCompany ?? "",
    insurerRnc: q.insurerRnc ?? "",
    policyNumber: q.policyNumber ?? "",
    claimNumber: q.claimNumber ?? "",
    adjusterName: q.adjusterName ?? "",
    adjusterPhone: q.adjusterPhone ?? "",
    deductibleAmount: toPlainNumber(q.deductibleAmount) ?? undefined,
    discountAmount: toPlainNumber(q.discountAmount) ?? 0,
    estimatedDays: q.estimatedDays ?? undefined,
    warrantyNotes: q.warrantyNotes ?? "",
    termsNotes: q.termsNotes ?? "",
    internalNotes: q.internalNotes ?? "",
    laborLines: q.laborLines.map((l) => ({
      area: l.area,
      description: l.description ?? "",
      lineTotal: toPlainNumber(l.lineTotal) ?? 0,
    })),
    materialLines: [],
    partLines: q.partLines.map((p) => ({
      partName: p.partName,
      description: p.description ?? "",
      quantity: toPlainNumber(p.quantity) ?? 1,
      unitPrice: toPlainNumber(p.unitPrice) ?? 0,
    })),
    damages: q.damages.map((d) => ({
      partName: d.partName ?? "",
      vehicleSide: (d.vehicleSide ?? undefined) as
        | "FRONT"
        | "BACK"
        | "LEFT"
        | "RIGHT"
        | "TOP"
        | undefined,
      damageType: (d.damageType ?? undefined) as
        | "SCRATCH"
        | "DENT"
        | "PAINT_DAMAGE"
        | "BROKEN"
        | "OTHER"
        | undefined,
      description: d.description ?? "",
    })),
    photos: [],
  };
}
