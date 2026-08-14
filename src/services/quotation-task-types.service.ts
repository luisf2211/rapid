import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession } from "@/lib/auth/tenant";
import type { QuotationTaskTypeInput } from "@/lib/validations/quotation-task-type";

export async function listQuotationTaskTypes(params?: { activeOnly?: boolean }) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.quotationTaskType.findMany({
    where: {
      CompanyId: companyId,
      ...(params?.activeOnly ? { IsActive: true } : {}),
    },
    orderBy: { Name: "asc" },
  });
}

export async function createQuotationTaskType(input: QuotationTaskTypeInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.quotationTaskType.create({
    data: {
      CompanyId: companyId,
      Name: input.name.trim(),
    },
  });
}

export async function updateQuotationTaskType(id: number, input: QuotationTaskTypeInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.quotationTaskType.update({
    where: { Id: id, CompanyId: companyId },
    data: { Name: input.name.trim(), UpdatedAt: new Date() },
  });
}

export async function toggleQuotationTaskType(id: number, isActive: boolean) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.quotationTaskType.update({
    where: { Id: id, CompanyId: companyId },
    data: { IsActive: isActive, UpdatedAt: new Date() },
  });
}
