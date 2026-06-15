"use server";

import { revalidatePath } from "next/cache";
import {
  materialRequisitionSchema,
  type MaterialRequisitionInput,
} from "@/lib/validations/material-requisition";
import { createMaterialRequisition } from "@/services/material-requisitions.service";

export type ActionState =
  | { ok: true; id: number; workOrderId: number }
  | { ok: false; error: string };

export async function createMaterialRequisitionAction(
  input: MaterialRequisitionInput,
): Promise<ActionState> {
  const parsed = materialRequisitionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const req = await createMaterialRequisition(parsed.data);
    revalidatePath("/material-requisitions");
    revalidatePath("/inventory");
    revalidatePath("/inventory/paint");
    const partIds = [
      ...parsed.data.materialItems.map((i) => i.inventoryPartId),
      ...parsed.data.paintItems.map((i) => i.inventoryPartId),
    ];
    for (const partId of partIds) {
      revalidatePath(`/inventory/${partId}`);
    }
    revalidatePath(`/work-orders/${parsed.data.workOrderId}`);
    revalidatePath("/dashboard");
    return { ok: true, id: req.id, workOrderId: parsed.data.workOrderId };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Error al crear la requisición",
    };
  }
}
