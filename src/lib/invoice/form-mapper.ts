import { toDateInputValue } from "@/lib/formatters/date";
import { toPlainNumber } from "@/lib/serialize";
import type { UpdateInvoiceInput } from "@/lib/validations/invoice";

type InvoiceWithLines = {
  id: number;
  invoiceNumber: number;
  status: string;
  workOrderId: number;
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
  billingType: string;
  discountAmount: unknown;
  notes: string | null;
  invoiceDate: Date;
  taxRate: unknown;
  lines: {
    lineType: string;
    description: string;
    quantity: unknown;
    unitPrice: unknown;
  }[];
};

export type InvoiceFormValues = UpdateInvoiceInput;

export function invoiceToFormValues(invoice: InvoiceWithLines): InvoiceFormValues {
  return {
    id: invoice.id,
    customerName: invoice.customerName,
    nationalId: invoice.nationalId ?? "",
    phone: invoice.phone ?? "",
    email: invoice.email ?? "",
    address: invoice.address ?? "",
    brand: invoice.brand ?? "",
    model: invoice.model ?? "",
    vehicleYear: invoice.vehicleYear ?? null,
    plate: invoice.plate ?? "",
    vin: invoice.vin ?? "",
    billingType:
      invoice.billingType === "INSURANCE" ? "INSURANCE" : "PRIVATE",
    discountAmount: toPlainNumber(invoice.discountAmount) ?? 0,
    notes: invoice.notes ?? "",
    invoiceDate: toDateInputValue(invoice.invoiceDate),
    lines: invoice.lines.map((l) => ({
      lineType: l.lineType as InvoiceFormValues["lines"][0]["lineType"],
      description: l.description,
      quantity: toPlainNumber(l.quantity) ?? 1,
      unitPrice: toPlainNumber(l.unitPrice) ?? 0,
    })),
  };
}
