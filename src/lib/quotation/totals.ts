export const INSURANCE_TAX_RATE = 0.18;

/** Particulares: precio final sin ITBIS. Aseguradoras: ITBIS 18%. */
export function quotationTaxRate(quotationType: string): number {
  return quotationType === "INSURANCE" ? INSURANCE_TAX_RATE : 0;
}

export type LineWithTotal = { lineTotal: number };

export function lineTotalFromQtyPrice(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function laborLineTotal(
  hours: number | undefined,
  rate: number | undefined,
  explicitTotal: number | undefined,
): number {
  if (hours != null && hours > 0 && rate != null && rate > 0) {
    return lineTotalFromQtyPrice(hours, rate);
  }
  return explicitTotal ?? 0;
}

export function computeQuotationTotals(input: {
  laborLines: LineWithTotal[];
  materialLines: LineWithTotal[];
  partLines: LineWithTotal[];
  discountAmount: number;
  taxRate: number;
}) {
  const laborSubtotal = input.laborLines.reduce((s, l) => s + l.lineTotal, 0);
  const materialSubtotal = input.materialLines.reduce((s, l) => s + l.lineTotal, 0);
  const partsSubtotal = input.partLines.reduce((s, l) => s + l.lineTotal, 0);
  const subtotal = laborSubtotal + materialSubtotal + partsSubtotal;
  const taxable = Math.max(0, subtotal - input.discountAmount);
  const taxAmount = Math.round(taxable * input.taxRate * 100) / 100;
  const grandTotal = Math.round((taxable + taxAmount) * 100) / 100;

  return {
    laborSubtotal,
    materialSubtotal,
    partsSubtotal,
    taxAmount,
    grandTotal,
  };
}
