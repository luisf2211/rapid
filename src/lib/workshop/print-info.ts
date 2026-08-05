import {
  getWorkshopSettings,
  getWorkshopSettingsByCompanyId,
} from "@/services/workshop-settings.service";
import { toPlainNumber } from "@/lib/serialize";

import { DEFAULT_WORKSHOP_STAMP_URL } from "@/lib/workshop/stamp";

/** Datos del taller para encabezados y pies de PDF/impresión. */
export type WorkshopPrintInfo = {
  businessName: string;
  tagline: string;
  legalName: string | null;
  rnc: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  stampUrl: string | null;
  website: string;
  socialFacebook: string;
  socialInstagram: string;
  socialHandle: string;
  quotationFooter: string | null;
  quotationWarrantyNotes: string | null;
  quotationPaymentNotes: string | null;
  invoiceFooter: string | null;
  defaultTaxRate: number;
  brandColor: string;
};

const ENV_DEFAULTS: WorkshopPrintInfo = {
  businessName: "RAPID",
  tagline: "TALLER DE PINTURA",
  legalName: "Rapid Taller de Pintura S.R.L.",
  rnc: "1-23-45678-9",
  phone: "(809) 555-7890",
  email: "info@rapid.com.do",
  address: "Av. Lope de Vega, Santo Domingo, República Dominicana",
  logoUrl: null,
  stampUrl: DEFAULT_WORKSHOP_STAMP_URL,
  website: "www.rapid.com.do",
  socialFacebook: "Rapid Taller de Pintura",
  socialInstagram: "@rapid_taller",
  socialHandle: "@rapid_taller",
  quotationFooter: null,
  quotationWarrantyNotes:
    "6 meses en pintura y 3 meses en carrocería (según política del taller).",
  quotationPaymentNotes: "50% anticipo al aprobar; saldo contra entrega.",
  invoiceFooter: null,
  defaultTaxRate: 0.18,
  brandColor: "#c41e3a",
};

function fromEnv(): WorkshopPrintInfo {
  return {
    businessName: process.env.NEXT_PUBLIC_WORKSHOP_NAME ?? ENV_DEFAULTS.businessName,
    tagline: process.env.NEXT_PUBLIC_WORKSHOP_TAGLINE ?? ENV_DEFAULTS.tagline,
    legalName: process.env.NEXT_PUBLIC_WORKSHOP_LEGAL_NAME ?? ENV_DEFAULTS.legalName,
    rnc: process.env.NEXT_PUBLIC_WORKSHOP_RNC ?? ENV_DEFAULTS.rnc,
    phone: process.env.NEXT_PUBLIC_WORKSHOP_PHONE ?? ENV_DEFAULTS.phone,
    email: process.env.NEXT_PUBLIC_WORKSHOP_EMAIL ?? ENV_DEFAULTS.email,
    address: process.env.NEXT_PUBLIC_WORKSHOP_ADDRESS ?? ENV_DEFAULTS.address,
    logoUrl: process.env.NEXT_PUBLIC_WORKSHOP_LOGO_URL ?? ENV_DEFAULTS.logoUrl,
    stampUrl: process.env.NEXT_PUBLIC_WORKSHOP_STAMP_URL ?? ENV_DEFAULTS.stampUrl,
    website: process.env.NEXT_PUBLIC_WORKSHOP_WEBSITE ?? ENV_DEFAULTS.website,
    socialFacebook:
      process.env.NEXT_PUBLIC_WORKSHOP_FACEBOOK ?? ENV_DEFAULTS.socialFacebook,
    socialInstagram:
      process.env.NEXT_PUBLIC_WORKSHOP_INSTAGRAM ?? ENV_DEFAULTS.socialInstagram,
    socialHandle:
      process.env.NEXT_PUBLIC_WORKSHOP_SOCIAL ?? ENV_DEFAULTS.socialHandle,
    quotationFooter:
      process.env.NEXT_PUBLIC_WORKSHOP_QUOTATION_FOOTER ??
      ENV_DEFAULTS.quotationFooter,
    quotationWarrantyNotes:
      process.env.NEXT_PUBLIC_WORKSHOP_QUOTATION_WARRANTY ??
      ENV_DEFAULTS.quotationWarrantyNotes,
    quotationPaymentNotes:
      process.env.NEXT_PUBLIC_WORKSHOP_QUOTATION_PAYMENT ??
      ENV_DEFAULTS.quotationPaymentNotes,
    invoiceFooter:
      process.env.NEXT_PUBLIC_WORKSHOP_INVOICE_FOOTER ??
      ENV_DEFAULTS.invoiceFooter,
    defaultTaxRate: ENV_DEFAULTS.defaultTaxRate,
    brandColor:
      process.env.NEXT_PUBLIC_WORKSHOP_BRAND_COLOR ?? ENV_DEFAULTS.brandColor,
  };
}

/**
 * Lee configuración de BD con respaldo en variables de entorno.
 * Con `companyId` no requiere sesión (rutas públicas de impresión, que
 * resuelven la empresa desde el documento a imprimir).
 */
export async function getWorkshopPrintInfo(
  companyId?: number,
): Promise<WorkshopPrintInfo> {
  const env = fromEnv();
  const row =
    companyId != null
      ? await getWorkshopSettingsByCompanyId(companyId)
      : await getWorkshopSettings();
  if (!row) return env;

  return {
    ...env,
    businessName: row.businessName || env.businessName,
    legalName: row.legalName ?? env.legalName,
    rnc: row.rnc ?? env.rnc,
    phone: row.phone ?? env.phone,
    email: row.email ?? env.email,
    address: row.address ?? env.address,
    logoUrl: row.logoUrl ?? env.logoUrl,
    stampUrl: row.stampUrl ?? env.stampUrl,
    quotationFooter: row.quotationFooter ?? env.quotationFooter,
    quotationWarrantyNotes:
      row.quotationWarrantyNotes ?? env.quotationWarrantyNotes,
    quotationPaymentNotes:
      row.quotationPaymentNotes ?? env.quotationPaymentNotes,
    invoiceFooter: row.invoiceFooter ?? env.invoiceFooter,
    defaultTaxRate: toPlainNumber(row.defaultTaxRate) ?? env.defaultTaxRate,
    brandColor: row.brandColor ?? env.brandColor,
  };
}
