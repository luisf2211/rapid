"use server";

import { revalidatePath } from "next/cache";
import {
  pettyCashFundSchema,
  pettyCashTransactionSchema,
} from "@/lib/validations/petty-cash";
import {
  createPettyCashFund,
  updatePettyCashFund,
  deletePettyCashFund,
  createPettyCashTransaction,
} from "@/services/petty-cash.service";

export type PettyCashActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createPettyCashFundAction(
  input: unknown,
): Promise<PettyCashActionState> {
  const parsed = pettyCashFundSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const fund = await createPettyCashFund(parsed.data);
    revalidatePath("/petty-cash");
    return { ok: true, id: fund.Id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear el fondo",
    };
  }
}

export async function updatePettyCashFundAction(
  id: number,
  input: unknown,
): Promise<PettyCashActionState> {
  const parsed = pettyCashFundSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await updatePettyCashFund(id, parsed.data);
    revalidatePath("/petty-cash");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar el fondo",
    };
  }
}

export async function deletePettyCashFundAction(
  id: number,
): Promise<PettyCashActionState> {
  try {
    await deletePettyCashFund(id);
    revalidatePath("/petty-cash");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al eliminar el fondo",
    };
  }
}

export async function createPettyCashTransactionAction(
  input: unknown,
): Promise<PettyCashActionState> {
  const parsed = pettyCashTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const tx = await createPettyCashTransaction(parsed.data);
    revalidatePath("/petty-cash");
    revalidatePath(`/petty-cash/${parsed.data.pettyCashFundId}`);
    revalidatePath("/dashboard");
    return { ok: true, id: tx.Id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al registrar transacción",
    };
  }
}
