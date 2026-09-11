"use server";

import { revalidatePath } from "next/cache";
import { acceptRequest, rejectRequest } from "@/services/quote-requests.service";

export type RequestActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function acceptRequestAction(id: number): Promise<RequestActionState> {
  try {
    const q = await acceptRequest(id);
    revalidatePath("/solicitudes");
    revalidatePath("/quotations");
    revalidatePath("/dashboard");
    return { ok: true, id: q.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo aceptar la solicitud",
    };
  }
}

export async function rejectRequestAction(
  id: number,
  reason: string,
): Promise<RequestActionState> {
  if (!reason.trim()) {
    return { ok: false, error: "Indica el motivo del rechazo" };
  }
  try {
    const q = await rejectRequest(id, reason);
    revalidatePath("/solicitudes");
    revalidatePath("/dashboard");
    return { ok: true, id: q.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo rechazar la solicitud",
    };
  }
}
