"use server";

import { revalidatePath } from "next/cache";
import { bankAccountSchema, bankTransactionSchema } from "@/lib/validations/bank";
import {
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  createBankTransaction,
} from "@/services/banks.service";

export type BankActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createBankAccountAction(
  input: unknown,
): Promise<BankActionState> {
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const account = await createBankAccount(parsed.data);
    revalidatePath("/banks");
    revalidatePath("/dashboard");
    return { ok: true, id: account.Id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear la cuenta",
    };
  }
}

export async function updateBankAccountAction(
  id: number,
  input: unknown,
): Promise<BankActionState> {
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await updateBankAccount(id, parsed.data);
    revalidatePath("/banks");
    revalidatePath(`/banks/${id}`);
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar la cuenta",
    };
  }
}

export async function deleteBankAccountAction(
  id: number,
): Promise<BankActionState> {
  try {
    await deleteBankAccount(id);
    revalidatePath("/banks");
    revalidatePath("/dashboard");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al eliminar la cuenta",
    };
  }
}

export async function createBankTransactionAction(
  input: unknown,
): Promise<BankActionState> {
  const parsed = bankTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const tx = await createBankTransaction(parsed.data);
    revalidatePath("/banks");
    revalidatePath(`/banks/${parsed.data.bankAccountId}`);
    revalidatePath("/dashboard");
    return { ok: true, id: tx.Id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al registrar transacción",
    };
  }
}
