import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession } from "@/lib/auth/tenant";
import { hashPassword } from "@/lib/auth/password";
import { USER_ROLES } from "@/lib/auth/constants";
import { serializePermissions, type ModuleKey } from "@/lib/auth/permissions";

export async function listCompanyUsers() {
  const companyId = await requireCompanyIdFromSession();
  return prisma.user.findMany({
    where: { companyId },
    orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      permissions: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
}

export async function getCompanyUser(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.user.findFirst({
    where: { id, companyId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      permissions: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
}

export async function createCompanyUserManaged(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  permissions: ModuleKey[];
}) {
  const companyId = await requireCompanyIdFromSession();

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase() },
  });
  if (existing) {
    throw new Error("Ya existe un usuario con ese correo electrónico");
  }

  const passwordHash = await hashPassword(input.password);
  const permissionsJson =
    input.role === USER_ROLES.COMPANY_ADMIN
      ? null
      : serializePermissions(input.permissions);

  return prisma.user.create({
    data: {
      email: input.email.trim().toLowerCase(),
      passwordHash,
      fullName: input.fullName.trim() || null,
      role: input.role,
      companyId,
      isActive: true,
      permissions: permissionsJson,
    },
  });
}

export async function updateCompanyUser(
  id: number,
  input: {
    fullName: string;
    role: string;
    permissions: ModuleKey[];
    isActive: boolean;
  },
) {
  const companyId = await requireCompanyIdFromSession();
  const user = await prisma.user.findFirst({ where: { id, companyId } });
  if (!user) throw new Error("Usuario no encontrado");

  const permissionsJson =
    input.role === USER_ROLES.COMPANY_ADMIN
      ? null
      : serializePermissions(input.permissions);

  return prisma.user.update({
    where: { id },
    data: {
      fullName: input.fullName.trim() || null,
      role: input.role,
      permissions: permissionsJson,
      isActive: input.isActive,
    },
  });
}

export async function resetUserPassword(id: number, newPassword: string) {
  const companyId = await requireCompanyIdFromSession();
  const user = await prisma.user.findFirst({ where: { id, companyId } });
  if (!user) throw new Error("Usuario no encontrado");

  const passwordHash = await hashPassword(newPassword);
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}

export async function deleteCompanyUser(id: number) {
  const companyId = await requireCompanyIdFromSession();
  const user = await prisma.user.findFirst({ where: { id, companyId } });
  if (!user) throw new Error("Usuario no encontrado");

  // Don't allow deleting yourself or the last admin
  const admins = await prisma.user.count({
    where: { companyId, role: USER_ROLES.COMPANY_ADMIN, isActive: true },
  });
  if (user.role === USER_ROLES.COMPANY_ADMIN && admins <= 1) {
    throw new Error("No puedes eliminar al último administrador");
  }

  return prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
}
