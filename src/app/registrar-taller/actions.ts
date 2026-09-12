"use server";

import { workshopSignupSchema } from "@/lib/validations/workshop-signup";
import { registerWorkshop } from "@/services/auth.service";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export type SignupActionState =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function registerWorkshopAction(
  input: unknown,
): Promise<SignupActionState> {
  const parsed = workshopSignupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const result = await registerWorkshop(parsed.data);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    // Auto-login del owner recién creado.
    const token = await createSessionToken(result.session);
    await setSessionCookie(token);

    return { ok: true, redirectTo: "/dashboard?welcome=1" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo crear el taller",
    };
  }
}
