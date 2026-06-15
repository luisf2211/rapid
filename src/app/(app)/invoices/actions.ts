"use server";

import { revalidatePath } from "next/cache";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "@/lib/validations/invoice";
import {
  createInvoiceFromWorkOrder,
  markInvoicePaid,
  updateInvoice,
  voidInvoice,
} from "@/services/invoices.service";

export type InvoiceActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createInvoiceAction(
  input: unknown,
): Promise<InvoiceActionState> {
  const parsed = createInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const inv = await createInvoiceFromWorkOrder(parsed.data);
    revalidatePath("/invoices");
    revalidatePath("/work-orders");
    revalidatePath(`/work-orders/${parsed.data.workOrderId}`);
    return { ok: true, id: inv.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al generar la factura",
    };
  }
}

export async function markInvoicePaidAction(
  id: number,
  paymentReference?: string,
): Promise<InvoiceActionState> {
  try {
    const inv = await markInvoicePaid(id, paymentReference);
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    revalidatePath("/work-orders");
    revalidatePath("/dashboard");
    revalidatePath(`/work-orders/${inv.workOrderId}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al registrar el pago",
    };
  }
}

export async function updateInvoiceAction(
  input: unknown,
): Promise<InvoiceActionState> {
  const parsed = updateInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const inv = await updateInvoice(parsed.data);
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${inv.id}`);
    revalidatePath(`/invoices/${inv.id}/edit`);
    revalidatePath(`/work-orders/${inv.workOrderId}`);
    return { ok: true, id: inv.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al guardar la factura",
    };
  }
}

export async function voidInvoiceAction(
  id: number,
  reason: string,
): Promise<InvoiceActionState> {
  if (!reason.trim()) {
    return { ok: false, error: "Indica el motivo de la anulación" };
  }
  try {
    await voidInvoice(id, reason);
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al anular",
    };
  }
}
