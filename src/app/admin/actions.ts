"use server";

import { revalidatePath } from "next/cache";
import {
  createCompanySchema,
  createUserSchema,
} from "@/lib/validations/auth";
import {
  createCompany,
  createCompanyUser,
  setCompanyActive,
  setUserActive,
} from "@/services/auth.service";
import { requirePlatformAdmin } from "@/lib/auth/guards";

export type AdminActionState =
  | { ok: true }
  | { ok: false; error: string };

export async function createCompanyAction(
  input: unknown,
): Promise<AdminActionState> {
  await requirePlatformAdmin();
  const parsed = createCompanySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await createCompany(parsed.data);
    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo crear la empresa",
    };
  }
}

export async function createUserAction(
  input: unknown,
): Promise<AdminActionState> {
  await requirePlatformAdmin();
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await createCompanyUser(parsed.data);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo crear el usuario",
    };
  }
}

export async function toggleCompanyActiveAction(
  id: number,
  isActive: boolean,
): Promise<AdminActionState> {
  await requirePlatformAdmin();
  try {
    await setCompanyActive(id, isActive);
    revalidatePath("/admin/companies");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar empresa",
    };
  }
}

export async function toggleUserActiveAction(
  id: number,
  isActive: boolean,
): Promise<AdminActionState> {
  await requirePlatformAdmin();
  try {
    await setUserActive(id, isActive);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al actualizar usuario",
    };
  }
}
