import { canEditInvoice } from "@/services/invoices.service";

/** Bloquea edición si la orden ya tiene factura pagada o anulada. */
export function canEditLaborOrder(invoiceStatus: string | null | undefined): boolean {
  if (!invoiceStatus) return true;
  return canEditInvoice(invoiceStatus);
}
