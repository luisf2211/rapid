"use server";

import { revalidatePath } from "next/cache";
import {
  workshopSettingsSchema,
  type WorkshopSettingsInput,
} from "@/lib/validations/workshop-settings";
import { upsertWorkshopSettings } from "@/services/workshop-settings.service";

export type ActionState = { ok: true } | { ok: false; error: string };

export async function updateWorkshopSettingsAction(
  input: WorkshopSettingsInput,
): Promise<ActionState> {
  const parsed = workshopSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await upsertWorkshopSettings(parsed.data);
    revalidatePath("/settings");
    revalidatePath("/print/invoices/[id]", "page");
    revalidatePath("/print/quotations/[id]", "page");
    revalidatePath("/print/work-orders/[id]", "page");
    revalidatePath("/print/labor-orders/[id]", "page");
    revalidatePath("/print/material-requisitions/[id]", "page");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "No se pudo guardar. Verifica que el script SQL 004 esté aplicado.",
    };
  }
}
