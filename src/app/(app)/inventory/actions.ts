"use server";

import { revalidatePath } from "next/cache";
import {
  inventoryMovementSchema,
  inventoryPartSchema,
  type InventoryMovementInput,
  type InventoryPartInput,
} from "@/lib/validations/inventory";
import {
  createInventoryMovement,
  createInventoryPart,
  deleteInventoryPart,
  updateInventoryPart,
} from "@/services/inventory.service";

export type ActionState =
  | { ok: true; id: number; mode?: "deleted" | "deactivated" }
  | { ok: false; error: string };

export async function createInventoryPartAction(
  input: InventoryPartInput,
): Promise<ActionState> {
  const parsed = inventoryPartSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const part = await createInventoryPart(parsed.data);
    revalidatePath("/inventory");
    return { ok: true, id: part.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear la pieza",
    };
  }
}

export async function updateInventoryPartAction(
  id: number,
  input: InventoryPartInput,
): Promise<ActionState> {
  const parsed = inventoryPartSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await updateInventoryPart(id, parsed.data);
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar la pieza",
    };
  }
}

export async function deleteInventoryPartAction(
  id: number,
): Promise<ActionState> {
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false, error: "Pieza inválida" };
  }
  try {
    const result = await deleteInventoryPart(id);
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${id}`);
    revalidatePath("/material-requisitions/new");
    return { ok: true, id, mode: result.mode };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al eliminar la pieza",
    };
  }
}

export async function createInventoryMovementAction(
  input: InventoryMovementInput,
): Promise<ActionState> {
  const parsed = inventoryMovementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const movement = await createInventoryMovement(parsed.data);
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${parsed.data.inventoryPartId}`);
    if (parsed.data.workOrderId) {
      revalidatePath(`/work-orders/${parsed.data.workOrderId}`);
    }
    return { ok: true, id: movement.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al registrar movimiento",
    };
  }
}
