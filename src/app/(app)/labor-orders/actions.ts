"use server";

import { revalidatePath } from "next/cache";
import {
  laborOrderSchema,
  type LaborOrderInput,
} from "@/lib/validations/labor-order";
import { createLaborOrder } from "@/services/labor-orders.service";

export type ActionState =
  | { ok: true; id: number; workOrderId: number }
  | { ok: false; error: string };

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
    revalidatePath("/labor-orders");
    revalidatePath(`/work-orders/${parsed.data.workOrderId}`);
    revalidatePath("/dashboard");
    return { ok: true, id: lo.id, workOrderId: parsed.data.workOrderId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear la mano de obra",
    };
  }
}
