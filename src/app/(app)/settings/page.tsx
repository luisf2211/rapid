import { PageHeader } from "@/components/ui/PageHeader";
import { getWorkshopSettings } from "@/services/workshop-settings.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { toPlainNumber } from "@/lib/serialize";
import { WorkshopSettingsForm } from "./WorkshopSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [row, printInfo] = await Promise.all([
    getWorkshopSettings(),
    getWorkshopPrintInfo(),
  ]);

  const defaults = {
    businessName: row?.businessName ?? printInfo.businessName,
    legalName: row?.legalName ?? printInfo.legalName ?? "",
    rnc: row?.rnc ?? printInfo.rnc ?? "",
    phone: row?.phone ?? printInfo.phone ?? "",
    email: row?.email ?? printInfo.email ?? "",
    address: row?.address ?? printInfo.address ?? "",
    logoUrl: row?.logoUrl ?? printInfo.logoUrl ?? "",
    stampUrl: row?.stampUrl ?? printInfo.stampUrl ?? "",
    defaultTaxRate: toPlainNumber(row?.defaultTaxRate) ?? printInfo.defaultTaxRate,
    quotationFooter: row?.quotationFooter ?? printInfo.quotationFooter ?? "",
    quotationWarrantyNotes:
      row?.quotationWarrantyNotes ?? printInfo.quotationWarrantyNotes ?? "",
    quotationPaymentNotes:
      row?.quotationPaymentNotes ?? printInfo.quotationPaymentNotes ?? "",
    invoiceFooter: row?.invoiceFooter ?? printInfo.invoiceFooter ?? "",
  };

  return (
    <>
      <PageHeader
        title="Configuración del taller"
        subtitle="Logo, datos fiscales y pies de página para documentos impresos."
      />
      <WorkshopSettingsForm defaults={defaults} fromDatabase={!!row} />
    </>
  );
}
