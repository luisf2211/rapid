"use server";

import { revalidatePath } from "next/cache";
import { expenseFormSchema, expenseCategorySchema } from "@/lib/validations/expense";
import {
  createExpense,
  updateExpense,
  deleteExpense,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/services/expenses.service";

export type ExpenseActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createExpenseAction(
  input: unknown,
): Promise<ExpenseActionState> {
  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const expense = await createExpense(parsed.data);
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { ok: true, id: expense.Id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al registrar el gasto",
    };
  }
}

export async function updateExpenseAction(
  id: number,
  input: unknown,
): Promise<ExpenseActionState> {
  const parsed = expenseFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await updateExpense(id, parsed.data);
    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}`);
    revalidatePath("/dashboard");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar el gasto",
    };
  }
}

export async function deleteExpenseAction(
  id: number,
): Promise<ExpenseActionState> {
  try {
    await deleteExpense(id);
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al eliminar el gasto",
    };
  }
}

export async function createExpenseCategoryAction(
  input: unknown,
): Promise<ExpenseActionState> {
  const parsed = expenseCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const cat = await createExpenseCategory(parsed.data);
    revalidatePath("/expenses");
    revalidatePath("/expenses/categories");
    return { ok: true, id: cat.Id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al crear la categoría",
    };
  }
}

export async function updateExpenseCategoryAction(
  id: number,
  input: unknown,
): Promise<ExpenseActionState> {
  const parsed = expenseCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await updateExpenseCategory(id, parsed.data);
    revalidatePath("/expenses");
    revalidatePath("/expenses/categories");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar la categoría",
    };
  }
}

export async function deleteExpenseCategoryAction(
  id: number,
): Promise<ExpenseActionState> {
  try {
    await deleteExpenseCategory(id);
    revalidatePath("/expenses");
    revalidatePath("/expenses/categories");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al eliminar la categoría",
    };
  }
}
