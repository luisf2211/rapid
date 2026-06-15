"use server";

import { revalidatePath } from "next/cache";
import {
  laborOrderSchema,
  type LaborOrderInput,
} from "@/lib/validations/labor-order";
import {
  createLaborOrder,
  updateLaborOrder,
} from "@/services/labor-orders.service";

export type ActionState =
  | { ok: true; id: number; workOrderId: number }
  | { ok: false; error: string };

function revalidateLaborPaths(workOrderId: number, laborOrderId: number) {
  revalidatePath("/labor-orders");
  revalidatePath(`/labor-orders/${laborOrderId}`);
  revalidatePath(`/work-orders/${workOrderId}`);
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
}

export async function createLaborOrderAction(
  input: LaborOrderInput,
): Promise<ActionState> {
  const parsed = laborOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const lo = await createLaborOrder(parsed.data);
    if (!lo) {
      return { ok: false, error: "No se pudo crear la mano de obra" };
    }
    revalidateLaborPaths(parsed.data.workOrderId, lo.id);
    return { ok: true, id: lo.id, workOrderId: parsed.data.workOrderId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear la mano de obra",
    };
  }
}

export async function updateLaborOrderAction(
  id: number,
  input: LaborOrderInput,
): Promise<ActionState> {
  const parsed = laborOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const lo = await updateLaborOrder(id, parsed.data);
    if (!lo) {
      return { ok: false, error: "No se pudo actualizar la mano de obra" };
    }
    revalidateLaborPaths(parsed.data.workOrderId, lo.id);
    return { ok: true, id: lo.id, workOrderId: parsed.data.workOrderId };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Error al actualizar la mano de obra",
    };
  }
}
