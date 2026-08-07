import { z } from "zod";

export const PAYMENT_METHODS = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "DEPOSIT", label: "Depósito" },
  { value: "CHECK", label: "Cheque" },
  { value: "CARD", label: "Tarjeta" },
] as const;

export const invoicePaymentSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "DEPOSIT", "CHECK", "CARD"]),
  bankName: z.string().max(100).optional().or(z.literal("")),
  reference: z.string().max(100).optional().or(z.literal("")),
  concept: z.string().max(250).optional().or(z.literal("")),
  receivedBy: z.string().max(150).optional().or(z.literal("")),
  deliveredBy: z.string().max(150).optional().or(z.literal("")),
  paymentDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type InvoicePaymentInput = z.infer<typeof invoicePaymentSchema>;
