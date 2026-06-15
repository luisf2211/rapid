import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/auth/constants";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireCompanySession(): Promise<
  SessionPayload & { companyId: number }
> {
  const session = await requireSession();
  if (session.role === USER_ROLES.PLATFORM_ADMIN) redirect("/admin");
  if (session.companyId == null) redirect("/login");
  return { ...session, companyId: session.companyId };
}

export async function requirePlatformAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== USER_ROLES.PLATFORM_ADMIN) redirect("/dashboard");
  return session;
}

export function assertCompanyAccess(
  session: SessionPayload,
  companyId: number,
): void {
  if (session.role === USER_ROLES.PLATFORM_ADMIN) return;
  if (session.companyId !== companyId) {
    throw new Error("No tienes acceso a esta empresa");
  }
}
