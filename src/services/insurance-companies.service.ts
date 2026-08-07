import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import type { InsuranceCompanyInput } from "@/lib/validations/insurance-company";

function emptyToNull(v: string | undefined | null): string | null {
  if (!v || !v.trim()) return null;
  return v.trim();
}

export async function listInsuranceCompanies(params?: { activeOnly?: boolean }) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.insuranceCompany.findMany({
    where: {
      CompanyId: companyId,
      ...(params?.activeOnly ? { IsActive: true } : {}),
    },
    orderBy: { Name: "asc" },
  });
}

export async function getInsuranceCompanyById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.insuranceCompany.findFirst({
    where: { Id: id, CompanyId: companyId },
  });
}

export async function createInsuranceCompany(input: InsuranceCompanyInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.insuranceCompany.create({
    data: {
      CompanyId: companyId,
      Name: input.name.trim(),
      Rnc: emptyToNull(input.rnc),
      Phone: emptyToNull(input.phone),
      Email: emptyToNull(input.email),
      ContactName: emptyToNull(input.contactName),
      Address: emptyToNull(input.address),
    },
  });
}

export async function updateInsuranceCompany(id: number, input: InsuranceCompanyInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.insuranceCompany.update({
    where: { Id: id, CompanyId: companyId },
    data: {
      Name: input.name.trim(),
      Rnc: emptyToNull(input.rnc),
      Phone: emptyToNull(input.phone),
      Email: emptyToNull(input.email),
      ContactName: emptyToNull(input.contactName),
      Address: emptyToNull(input.address),
      UpdatedAt: new Date(),
    },
  });
}

export async function toggleInsuranceCompany(id: number, isActive: boolean) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.insuranceCompany.update({
    where: { Id: id, CompanyId: companyId },
    data: { IsActive: isActive, UpdatedAt: new Date() },
  });
}
