import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/auth/constants";

export async function requireCompanyIdFromSession(): Promise<number> {
  const session = await getSession();
  if (!session?.companyId) {
    throw new Error("Sesión inválida o sin empresa");
  }
  if (session.role === USER_ROLES.PLATFORM_ADMIN) {
    throw new Error("Use el panel de administración");
  }
  return session.companyId;
}

export function companyWhere(companyId: number) {
  return { CompanyId: companyId };
}
