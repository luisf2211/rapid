import { formatDate } from "@/lib/formatters/date";
import { toPlainNumber } from "@/lib/serialize";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";

type InvoiceWithLines = {
  id: number;
  invoiceNumber: number;
  invoiceDate: Date;
  billingType: string;
  customerName: string;
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  plate: string | null;
  vin: string | null;
  laborSubtotal: unknown;
  materialSubtotal: unknown;
  partsSubtotal: unknown;
  subtotal: unknown;
  discountAmount: unknown;
  taxRate: unknown;
  taxAmount: unknown;
  grandTotal: unknown;
  notes: string | null;
  status: string;
  lines: {
    lineType: string;
    description: string;
    quantity: unknown;
    unitPrice: unknown;
    lineTotal: unknown;
  }[];
  quotation?: {
    insuranceCompany: string | null;
    policyNumber: string | null;
    deductibleAmount: unknown;
  } | null;
};

export type InvoicePrintData = {
  docTitle: string;
  docNumber: string;
  invoiceDate: string;
  billingType: string;
  billingLabel: string;
  customerName: string;
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  plate: string | null;
  vin: string | null;
  insuranceCompany: string | null;
  policyNumber: string | null;
  deductibleAmount: number | null;
  laborSubtotal: number;
  materialSubtotal: number;
  partsSubtotal: number;
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  showTax: boolean;
  notes: string | null;
  status: string;
  lines: {
    description: string;
    quantity: string;
    unitPrice: number;
    lineTotal: number;
  }[];
};

export function buildInvoicePrintData(
  invoice: InvoiceWithLines,
  _workshop: WorkshopPrintInfo,
): InvoicePrintData {
  const billingLabel =
    invoice.billingType === "INSURANCE" ? "Aseguradora" : "Particular";
  const taxRate = toPlainNumber(invoice.taxRate) ?? 0;

  return {
    docTitle: "FACTURA",
    docNumber: `FAC-${String(invoice.invoiceNumber).padStart(5, "0")}`,
    invoiceDate: formatDate(invoice.invoiceDate),
    billingType: invoice.billingType,
    billingLabel,
    customerName: invoice.customerName,
    nationalId: invoice.nationalId,
    phone: invoice.phone,
    email: invoice.email,
    address: invoice.address,
    brand: invoice.brand,
    model: invoice.model,
    vehicleYear: invoice.vehicleYear,
    plate: invoice.plate,
    vin: invoice.vin,
    insuranceCompany: invoice.quotation?.insuranceCompany ?? null,
    policyNumber: invoice.quotation?.policyNumber ?? null,
    deductibleAmount: toPlainNumber(invoice.quotation?.deductibleAmount),
    laborSubtotal: toPlainNumber(invoice.laborSubtotal) ?? 0,
    materialSubtotal: toPlainNumber(invoice.materialSubtotal) ?? 0,
    partsSubtotal: toPlainNumber(invoice.partsSubtotal) ?? 0,
    subtotal: toPlainNumber(invoice.subtotal) ?? 0,
    discountAmount: toPlainNumber(invoice.discountAmount) ?? 0,
    taxRate,
    taxAmount: toPlainNumber(invoice.taxAmount) ?? 0,
    grandTotal: toPlainNumber(invoice.grandTotal) ?? 0,
    showTax: taxRate > 0,
    notes: invoice.notes,
    status: invoice.status,
    lines: invoice.lines.map((l) => ({
      description: l.description,
      quantity: String(toPlainNumber(l.quantity) ?? 1),
      unitPrice: toPlainNumber(l.unitPrice) ?? 0,
      lineTotal: toPlainNumber(l.lineTotal) ?? 0,
    })),
  };
}
