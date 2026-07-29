"use server";

import { revalidatePath } from "next/cache";
import { createUserSchema, updateUserSchema, resetPasswordSchema } from "@/lib/validations/user";
import {
  createCompanyUserManaged,
  updateCompanyUser,
  deleteCompanyUser,
  resetUserPassword,
} from "@/services/users.service";
import type { ModuleKey } from "@/lib/auth/permissions";

export type UserActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

export async function createUserAction(input: unknown): Promise<UserActionState> {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    const user = await createCompanyUserManaged({
      ...parsed.data,
      permissions: parsed.data.permissions as ModuleKey[],
    });
    revalidatePath("/users");
    return { ok: true, id: user.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al crear usuario" };
  }
}

export async function updateUserAction(id: number, input: unknown): Promise<UserActionState> {
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    await updateCompanyUser(id, {
      ...parsed.data,
      permissions: parsed.data.permissions as ModuleKey[],
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al actualizar usuario" };
  }
}

export async function deleteUserAction(id: number): Promise<UserActionState> {
  try {
    await deleteCompanyUser(id);
    revalidatePath("/users");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al eliminar usuario" };
  }
}

export async function resetPasswordAction(id: number, input: unknown): Promise<UserActionState> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    await resetUserPassword(id, parsed.data.password);
    revalidatePath(`/users/${id}`);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al cambiar contraseña" };
  }
}
