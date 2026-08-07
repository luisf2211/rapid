"use server";

import { revalidatePath } from "next/cache";
import { invoicePaymentSchema, type InvoicePaymentInput } from "@/lib/validations/invoice-payment";
import { createInvoicePayment } from "@/services/invoice-payments.service";

export type PaymentActionState = { ok: true; paymentId: number } | { ok: false; error: string };

export async function createPaymentAction(
  invoiceId: number,
  input: InvoicePaymentInput,
): Promise<PaymentActionState> {
  const parsed = invoicePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    const payment = await createInvoicePayment(invoiceId, parsed.data);
    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    return { ok: true, paymentId: payment.Id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al registrar abono" };
  }
}
