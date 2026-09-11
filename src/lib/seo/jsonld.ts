import { SITE_URL, SITE_NAME, BRAND, absoluteUrl } from "./config";

/** Organization: identidad de la marca Rapid. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    description: BRAND.description,
    email: BRAND.email,
    areaServed: "DO",
  };
}

/** WebSite: habilita el nombre del sitio en resultados. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export type BreadcrumbItem = { name: string; path: string };

/** BreadcrumbList para páginas internas de navegación. */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export type AutoRepairInput = {
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  services?: string[];
};

/** AutoRepair (LocalBusiness) para el perfil público de un taller aprobado. */
export function autoRepairSchema(w: AutoRepairInput) {
  const url = absoluteUrl(`/talleres/${w.slug}`);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${url}#business`,
    name: w.name,
    url,
    image: w.logoUrl || undefined,
    description: w.description || undefined,
    telephone: w.phone || undefined,
    areaServed: w.city || "DO",
  };

  if (w.address || w.city) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: w.address || undefined,
      addressLocality: w.city || undefined,
      addressCountry: "DO",
    };
  }
  if (w.latitude != null && w.longitude != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: w.latitude,
      longitude: w.longitude,
    };
  }
  if (w.services && w.services.length > 0) {
    schema.makesOffer = w.services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s },
    }));
  }
  return schema;
}

/** Service schema para las páginas /servicios/[slug]. */
export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "DO",
    serviceType: input.name,
  };
}
