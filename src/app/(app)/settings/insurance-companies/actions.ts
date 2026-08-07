"use server";

import { revalidatePath } from "next/cache";
import {
  insuranceCompanySchema,
  type InsuranceCompanyInput,
} from "@/lib/validations/insurance-company";
import {
  createInsuranceCompany,
  updateInsuranceCompany,
  toggleInsuranceCompany,
} from "@/services/insurance-companies.service";

export type ActionState = { ok: true; id?: number } | { ok: false; error: string };

export async function createInsuranceCompanyAction(
  input: InsuranceCompanyInput,
): Promise<ActionState> {
  const parsed = insuranceCompanySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    const row = await createInsuranceCompany(parsed.data);
    revalidatePath("/settings/insurance-companies");
    return { ok: true, id: row.Id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    if (msg.includes("Unique constraint")) {
      return { ok: false, error: "Ya existe una aseguradora con ese nombre." };
    }
    return { ok: false, error: msg };
  }
}

export async function updateInsuranceCompanyAction(
  id: number,
  input: InsuranceCompanyInput,
): Promise<ActionState> {
  const parsed = insuranceCompanySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  try {
    await updateInsuranceCompany(id, parsed.data);
    revalidatePath("/settings/insurance-companies");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}

export async function toggleInsuranceCompanyAction(
  id: number,
  isActive: boolean,
): Promise<ActionState> {
  try {
    await toggleInsuranceCompany(id, isActive);
    revalidatePath("/settings/insurance-companies");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error desconocido" };
  }
}
