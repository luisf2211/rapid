import { prisma } from "@/lib/prisma";
import { USER_ROLES } from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  normalizeLoginEmail,
  type SessionPayload,
} from "@/lib/auth/session";

export async function authenticateUser(
  email: string,
  password: string,
): Promise<SessionPayload | null> {
  const normalizedEmail = normalizeLoginEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { company: true },
  });

  if (!user || !user.isActive) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as SessionPayload["role"],
    companyId: user.companyId,
    companyName: user.company?.name ?? null,
  };
}

export async function loginUser(email: string, password: string) {
  const session = await authenticateUser(email, password);
  if (!session) return null;
  return createSessionToken(session);
}

export async function listCompanies() {
  return prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { users: true, workOrders: true } },
    },
  });
}

export async function createCompany(input: {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  adminFullName?: string;
}) {
  const slug = input.slug.trim().toLowerCase();
  const passwordHash = await hashPassword(input.adminPassword);

  return prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.name.trim(),
        slug,
        isActive: true,
      },
    });

    const settingsId =
      ((await tx.workshopSettings.aggregate({ _max: { id: true } }))._max.id ??
        0) + 1;

    await tx.workshopSettings.create({
      data: {
        id: settingsId,
        CompanyId: company.id,
        businessName: input.name.trim(),
        defaultTaxRate: 0.18,
      },
    });

    const user = await tx.user.create({
      data: {
        email: input.adminEmail.trim().toLowerCase(),
        passwordHash,
        fullName: input.adminFullName?.trim() || input.name.trim(),
        role: USER_ROLES.COMPANY_ADMIN,
        companyId: company.id,
        isActive: true,
      },
    });

    return { company, user };
  });
}

export async function listUsers(params?: { companyId?: number }) {
  return prisma.user.findMany({
    where: params?.companyId ? { companyId: params.companyId } : undefined,
    orderBy: [{ companyId: "asc" }, { email: "asc" }],
    include: { company: true },
  });
}

export async function createCompanyUser(input: {
  companyId: number;
  email: string;
  password: string;
  fullName?: string;
  role?: string;
}) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      email: input.email.trim().toLowerCase(),
      passwordHash,
      fullName: input.fullName?.trim() || null,
      role: input.role ?? USER_ROLES.COMPANY_USER,
      companyId: input.companyId,
      isActive: true,
    },
  });
}

export async function setCompanyActive(id: number, isActive: boolean) {
  return prisma.company.update({
    where: { id },
    data: { isActive },
  });
}

export async function setUserActive(id: number, isActive: boolean) {
  return prisma.user.update({
    where: { id },
    data: { isActive },
  });
}
