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
    permissions: user.permissions ?? null,
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function citySlugify(input: string): string {
  return slugify(input);
}

export type RegisterWorkshopInput = {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  password: string;
  workshopName: string;
  rnc?: string;
  workshopPhone?: string;
  whatsapp?: string;
  address?: string;
  city: string;
  services: string[];
  description?: string;
};

export type RegisterWorkshopResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; error: string };

/**
 * Registro self-service de un taller. Crea Company (estado PENDING, no listada),
 * WorkshopSettings con el perfil, y el usuario OWNER (COMPANY_ADMIN).
 * Devuelve el SessionPayload para iniciar sesión automáticamente.
 * El taller NO aparece en el directorio público hasta ser aprobado.
 */
export async function registerWorkshop(
  input: RegisterWorkshopInput,
): Promise<RegisterWorkshopResult> {
  const email = input.ownerEmail.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con este correo" };
  }

  // Slug único a partir del nombre del taller.
  const base = slugify(input.workshopName) || "taller";
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const taken = await prisma.company.findUnique({ where: { slug } });
    if (!taken) break;
    slug = `${base}-${i}`;
  }

  const passwordHash = await hashPassword(input.password);
  const fullName = `${input.ownerFirstName.trim()} ${input.ownerLastName.trim()}`.trim();
  const servicesCsv = input.services.join(",");
  const phone = input.workshopPhone?.trim() || input.ownerPhone.trim();

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.workshopName.trim(),
        slug,
        isActive: true,
        // Estado de aprobación: pendiente, no listado (no se indexa aún).
        publicStatus: "PENDING",
        isPublicListed: false,
        isPublicForQuotes: false,
        publicCity: input.city.trim(),
        citySlug: citySlugify(input.city),
        publicWhatsapp: input.whatsapp?.trim() || null,
        publicServices: servicesCsv,
        publicDescription: input.description?.trim() || null,
      },
    });

    const settingsId =
      ((await tx.workshopSettings.aggregate({ _max: { id: true } }))._max.id ??
        0) + 1;

    await tx.workshopSettings.create({
      data: {
        id: settingsId,
        CompanyId: company.id,
        businessName: input.workshopName.trim(),
        rnc: input.rnc?.trim() || null,
        phone,
        email,
        address: input.address?.trim() || null,
        defaultTaxRate: 0.18,
      },
    });

    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: USER_ROLES.COMPANY_ADMIN, // OWNER del taller
        companyId: company.id,
        isActive: true,
      },
    });

    return { company, user };
  });

  const session: SessionPayload = {
    userId: result.user.id,
    email: result.user.email,
    fullName: result.user.fullName,
    role: result.user.role as SessionPayload["role"],
    companyId: result.company.id,
    companyName: result.company.name,
    permissions: null,
  };

  return { ok: true, session };
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
