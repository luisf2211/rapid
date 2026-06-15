import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession } from "@/lib/auth/tenant";
import { toPlainNumber } from "@/lib/serialize";
import type { WorkshopSettingsInput } from "@/lib/validations/workshop-settings";

function emptyToNull(v: string | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

export async function getWorkshopSettings() {
  const companyId = await requireCompanyIdFromSession();
  try {
    return await prisma.workshopSettings.findFirst({
      where: { CompanyId: companyId },
    });
  } catch {
    return null;
  }
}

export async function upsertWorkshopSettings(input: WorkshopSettingsInput) {
  const companyId = await requireCompanyIdFromSession();
  const data = {
    businessName: input.businessName.trim(),
    legalName: emptyToNull(input.legalName),
    rnc: emptyToNull(input.rnc),
    phone: emptyToNull(input.phone),
    email: emptyToNull(input.email),
    address: emptyToNull(input.address),
    logoUrl: emptyToNull(input.logoUrl),
    stampUrl: emptyToNull(input.stampUrl),
    defaultTaxRate: input.defaultTaxRate,
    quotationFooter: emptyToNull(input.quotationFooter),
    quotationWarrantyNotes: emptyToNull(input.quotationWarrantyNotes),
    quotationPaymentNotes: emptyToNull(input.quotationPaymentNotes),
    invoiceFooter: emptyToNull(input.invoiceFooter),
    updatedAt: new Date(),
    updatedBy: emptyToNull(input.updatedBy),
  };

  const existing = await prisma.workshopSettings.findFirst({
    where: { CompanyId: companyId },
  });

  if (existing) {
    return prisma.workshopSettings.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.workshopSettings.create({
    data: {
      id:
        ((await prisma.workshopSettings.aggregate({ _max: { id: true } }))._max
          .id ?? 0) + 1,
      CompanyId: companyId,
      ...data,
    },
  });
}

export async function getDefaultTaxRate(): Promise<number> {
  const row = await getWorkshopSettings();
  return toPlainNumber(row?.defaultTaxRate) ?? 0.18;
}

/** Para impresión sin sesión de taller (rutas print). */
export async function getWorkshopSettingsByCompanyId(companyId: number) {
  return prisma.workshopSettings.findFirst({
    where: { CompanyId: companyId },
  });
}
