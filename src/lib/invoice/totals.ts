export function invoiceTaxRate(billingType: string): number {
  return billingType === "INSURANCE" ? 0.18 : 0;
}

export function computeInvoiceTotals(input: {
  laborSubtotal: number;
  materialSubtotal: number;
  partsSubtotal: number;
  discountAmount: number;
  taxRate: number;
}) {
  const subtotal =
    input.laborSubtotal + input.materialSubtotal + input.partsSubtotal;
  const taxable = Math.max(0, subtotal - input.discountAmount);
  const taxAmount = Math.round(taxable * input.taxRate * 100) / 100;
  const grandTotal = Math.round((taxable + taxAmount) * 100) / 100;

  return {
    subtotal,
    taxAmount,
    grandTotal,
  };
}
