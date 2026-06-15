"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/auth/constants";

export type LoginActionState =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function loginAction(
  input: unknown,
  nextPath?: string,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const token = await loginUser(parsed.data.email, parsed.data.password);
    if (!token) {
      return { ok: false, error: "Correo o contraseña incorrectos" };
    }

    await setSessionCookie(token);

    const session = await import("@/lib/auth/session").then((m) =>
      m.verifySessionToken(token),
    );
    const redirectTo =
      session?.role === USER_ROLES.PLATFORM_ADMIN
        ? "/admin"
        : nextPath && nextPath.startsWith("/") && !nextPath.startsWith("/login")
          ? nextPath
          : "/dashboard";

    return { ok: true, redirectTo };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al iniciar sesión",
    };
  }
}

export async function logoutAction() {
  const { clearSessionCookie } = await import("@/lib/auth/session");
  await clearSessionCookie();
  redirect("/login");
}
