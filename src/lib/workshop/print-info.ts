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
  website: string;
  socialFacebook: string;
  socialInstagram: string;
  socialHandle: string;
  quotationFooter: string | null;
};

const DEFAULTS: WorkshopPrintInfo = {
  businessName: "RAPID",
  tagline: "TALLER DE PINTURA",
  legalName: "Rapid Taller de Pintura S.R.L.",
  rnc: "1-23-45678-9",
  phone: "(809) 555-7890",
  email: "info@rapid.com.do",
  address: "Av. Lope de Vega, Santo Domingo, República Dominicana",
  logoUrl: null,
  website: "www.rapid.com.do",
  socialFacebook: "Rapid Taller de Pintura",
  socialInstagram: "@rapid_taller",
  socialHandle: "@rapid_taller",
  quotationFooter: null,
};

export function getWorkshopPrintInfo(): WorkshopPrintInfo {
  return {
    businessName: process.env.NEXT_PUBLIC_WORKSHOP_NAME ?? DEFAULTS.businessName,
    tagline: process.env.NEXT_PUBLIC_WORKSHOP_TAGLINE ?? DEFAULTS.tagline,
    legalName: process.env.NEXT_PUBLIC_WORKSHOP_LEGAL_NAME ?? DEFAULTS.legalName,
    rnc: process.env.NEXT_PUBLIC_WORKSHOP_RNC ?? DEFAULTS.rnc,
    phone: process.env.NEXT_PUBLIC_WORKSHOP_PHONE ?? DEFAULTS.phone,
    email: process.env.NEXT_PUBLIC_WORKSHOP_EMAIL ?? DEFAULTS.email,
    address: process.env.NEXT_PUBLIC_WORKSHOP_ADDRESS ?? DEFAULTS.address,
    logoUrl: process.env.NEXT_PUBLIC_WORKSHOP_LOGO_URL ?? DEFAULTS.logoUrl,
    website: process.env.NEXT_PUBLIC_WORKSHOP_WEBSITE ?? DEFAULTS.website,
    socialFacebook:
      process.env.NEXT_PUBLIC_WORKSHOP_FACEBOOK ?? DEFAULTS.socialFacebook,
    socialInstagram:
      process.env.NEXT_PUBLIC_WORKSHOP_INSTAGRAM ?? DEFAULTS.socialInstagram,
    socialHandle:
      process.env.NEXT_PUBLIC_WORKSHOP_SOCIAL ?? DEFAULTS.socialHandle,
    quotationFooter:
      process.env.NEXT_PUBLIC_WORKSHOP_QUOTATION_FOOTER ??
      DEFAULTS.quotationFooter,
  };
}
