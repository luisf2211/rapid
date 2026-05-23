"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  workOrderSchema,
  type WorkOrderInput,
} from "@/lib/validations/work-order";
import {
  createWorkOrder,
  updateWorkOrderStatus,
} from "@/services/work-orders.service";

export type ActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createWorkOrderAction(
  input: WorkOrderInput,
): Promise<ActionState> {
  const parsed = workOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const order = await createWorkOrder(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/work-orders");
    return { ok: true, id: order.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear la orden",
    };
  }
}

export async function changeWorkOrderStatusAction(
  formData: FormData,
): Promise<void> {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  await updateWorkOrderStatus(id, status);
  revalidatePath(`/work-orders/${id}`);
  revalidatePath("/work-orders");
  revalidatePath("/dashboard");
  redirect(`/work-orders/${id}`);
}
