"use server";

import { revalidatePath } from "next/cache";
import {
  quotationTaskTypeSchema,
  type QuotationTaskTypeInput,
} from "@/lib/validations/quotation-task-type";
import {
  createQuotationTaskType,
  updateQuotationTaskType,
  toggleQuotationTaskType,
} from "@/services/quotation-task-types.service";

export type ActionState = { ok: true; id?: number } | { ok: false; error: string };

export async function createQuotationTaskTypeAction(
  input: QuotationTaskTypeInput,
): Promise<ActionState> {
  const parsed = quotationTaskTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    const row = await createQuotationTaskType(parsed.data);
    revalidatePath("/settings/labor-tasks");
    return { ok: true, id: row.Id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    if (msg.includes("Unique constraint")) {
      return { ok: false, error: "Ya existe una tarea con ese nombre." };
    }
    return { ok: false, error: msg };
  }
}

export async function updateQuotationTaskTypeAction(
  id: number,
  input: QuotationTaskTypeInput,
): Promise<ActionState> {
  const parsed = quotationTaskTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    await updateQuotationTaskType(id, parsed.data);
    revalidatePath("/settings/labor-tasks");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    if (msg.includes("Unique constraint")) {
      return { ok: false, error: "Ya existe una tarea con ese nombre." };
    }
    return { ok: false, error: msg };
  }
}

export async function toggleQuotationTaskTypeAction(
  id: number,
  isActive: boolean,
): Promise<ActionState> {
  try {
    await toggleQuotationTaskType(id, isActive);
    revalidatePath("/settings/labor-tasks");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
