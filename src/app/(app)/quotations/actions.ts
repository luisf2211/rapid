"use server";

import { revalidatePath } from "next/cache";
import {
  quotationSchema,
  quotationPhotoSchema,
  type QuotationInput,
  type QuotationPhotoInput,
} from "@/lib/validations/quotation";
import {
  addQuotationPhotos,
  approveQuotation,
  convertQuotationToWorkOrder,
  createQuotation,
  deleteQuotation,
  deleteQuotationPhoto,
  rejectQuotation,
  updateQuotation,
} from "@/services/quotations.service";

export type ActionState =
  | { ok: true; id: number }
  | { ok: true; workOrderId: number }
  | { ok: false; error: string };

export async function createQuotationAction(
  input: QuotationInput,
): Promise<ActionState> {
  const parsed = quotationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const q = await createQuotation(parsed.data);
    revalidatePath("/quotations");
    revalidatePath("/dashboard");
    return { ok: true, id: q.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear la cotización",
    };
  }
}

export async function approveQuotationAction(id: number): Promise<ActionState> {
  try {
    await approveQuotation(id);
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al aprobar",
    };
  }
}

export async function rejectQuotationAction(
  id: number,
  reason: string,
): Promise<ActionState> {
  if (!reason.trim()) {
    return { ok: false, error: "Indica el motivo del rechazo" };
  }
  try {
    await rejectQuotation(id, reason);
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al rechazar",
    };
  }
}

export async function updateQuotationAction(
  id: number,
  input: QuotationInput,
  options?: { preserveStatus?: boolean },
): Promise<ActionState> {
  const parsed = quotationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await updateQuotation(id, parsed.data, options);
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    revalidatePath(`/quotations/${id}/edit`);
    revalidatePath(`/print/quotations/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar",
    };
  }
}

export async function deleteQuotationAction(id: number): Promise<ActionState> {
  try {
    await deleteQuotation(id);
    revalidatePath("/quotations");
    revalidatePath("/dashboard");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al eliminar",
    };
  }
}

export async function addQuotationPhotosAction(
  quotationId: number,
  photos: QuotationPhotoInput[],
): Promise<ActionState> {
  const parsed = photos.map((p) => quotationPhotoSchema.safeParse(p));
  if (parsed.some((r) => !r.success)) {
    return { ok: false, error: "Datos de foto inválidos" };
  }
  try {
    await addQuotationPhotos(
      quotationId,
      parsed.map((r) => r.data!),
    );
    revalidatePath(`/quotations/${quotationId}`);
    revalidatePath(`/print/quotations/${quotationId}`);
    return { ok: true, id: quotationId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al guardar fotos",
    };
  }
}

export async function deleteQuotationPhotoAction(
  quotationId: number,
  photoId: number,
): Promise<ActionState> {
  try {
    await deleteQuotationPhoto(quotationId, photoId);
    revalidatePath(`/quotations/${quotationId}`);
    revalidatePath(`/print/quotations/${quotationId}`);
    return { ok: true, id: quotationId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al eliminar foto",
    };
  }
}

export async function convertQuotationAction(id: number): Promise<ActionState> {
  try {
    const wo = await convertQuotationToWorkOrder(id);
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    revalidatePath("/work-orders");
    revalidatePath(`/work-orders/${wo.id}`);
    revalidatePath("/dashboard");
    return { ok: true, workOrderId: wo.id };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Error al crear la orden de recepción",
    };
  }
}
