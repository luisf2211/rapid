import { prisma } from "@/lib/prisma";

/** Solo se muestran/indexan talleres aprobados y listados. */
const PUBLIC_WHERE = {
  isActive: true,
  isPublicListed: true,
  publicStatus: "APPROVED",
} as const;

export type DirectoryWorkshop = {
  slug: string;
  name: string;
  logoUrl: string | null;
  city: string | null;
  citySlug: string | null;
  tagline: string | null;
  services: string[];
};

function parseServices(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function resolveName(
  companyName: string,
  settingsName: string | null | undefined,
): string {
  return settingsName?.trim() || companyName;
}

/** Lista de talleres para el directorio público /talleres. */
export async function listDirectoryWorkshops(params?: {
  citySlug?: string;
}): Promise<DirectoryWorkshop[]> {
  const rows = await prisma.company.findMany({
    where: {
      ...PUBLIC_WHERE,
      ...(params?.citySlug ? { citySlug: params.citySlug } : {}),
    },
    orderBy: [{ publicRank: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      logoUrl: true,
      publicCity: true,
      citySlug: true,
      publicTagline: true,
      publicServices: true,
      workshopSettings: {
        select: { businessName: true, logoUrl: true },
        take: 1,
      },
    },
  });

  return rows.map((c) => ({
    slug: c.slug,
    name: resolveName(c.name, c.workshopSettings[0]?.businessName),
    logoUrl: c.workshopSettings[0]?.logoUrl || c.logoUrl,
    city: c.publicCity,
    citySlug: c.citySlug,
    tagline: c.publicTagline,
    services: parseServices(c.publicServices),
  }));
}

/** Ciudades con al menos un taller aprobado (para /talleres/[ciudad] futuro). */
export async function listWorkshopCities(): Promise<
  { citySlug: string; city: string; count: number }[]
> {
  const rows = await prisma.company.findMany({
    where: { ...PUBLIC_WHERE, citySlug: { not: null } },
    select: { citySlug: true, publicCity: true },
  });
  const map = new Map<string, { city: string; count: number }>();
  for (const r of rows) {
    if (!r.citySlug) continue;
    const existing = map.get(r.citySlug);
    if (existing) existing.count += 1;
    else map.set(r.citySlug, { city: r.publicCity ?? r.citySlug, count: 1 });
  }
  return Array.from(map.entries()).map(([citySlug, v]) => ({
    citySlug,
    city: v.city,
    count: v.count,
  }));
}

export type PublicWorkshopProfile = {
  slug: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  tagline: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  citySlug: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string[];
  isApproved: boolean;
};

/**
 * Perfil público de un taller por slug. Devuelve el perfil aunque no esté
 * aprobado (con isApproved=false) para que la página decida noindex/404.
 */
export async function getWorkshopProfile(
  slug: string,
): Promise<PublicWorkshopProfile | null> {
  const c = await prisma.company.findFirst({
    where: { slug: slug.trim().toLowerCase(), isActive: true },
    select: {
      slug: true,
      name: true,
      logoUrl: true,
      publicDescription: true,
      publicTagline: true,
      publicPhone: true,
      publicWhatsapp: true,
      publicCity: true,
      citySlug: true,
      latitude: true,
      longitude: true,
      publicServices: true,
      publicStatus: true,
      isPublicListed: true,
      workshopSettings: {
        select: {
          businessName: true,
          logoUrl: true,
          phone: true,
          address: true,
        },
        take: 1,
      },
    },
  });
  if (!c) return null;

  const s = c.workshopSettings[0];
  const isApproved = c.publicStatus === "APPROVED" && c.isPublicListed;

  return {
    slug: c.slug,
    name: resolveName(c.name, s?.businessName),
    logoUrl: s?.logoUrl || c.logoUrl,
    description: c.publicDescription,
    tagline: c.publicTagline,
    phone: s?.phone?.trim() || c.publicPhone,
    whatsapp: c.publicWhatsapp,
    address: s?.address ?? null,
    city: c.publicCity,
    citySlug: c.citySlug,
    latitude: c.latitude != null ? Number(c.latitude) : null,
    longitude: c.longitude != null ? Number(c.longitude) : null,
    services: parseServices(c.publicServices),
    isApproved,
  };
}

/**
 * Umbral mínimo de talleres para publicar/indexar una página de ciudad.
 * Evita crear páginas de ciudad vacías o con contenido pobre.
 */
export const MIN_WORKSHOPS_PER_CITY = 3;

/** Devuelve la ciudad si el slug tiene densidad suficiente para publicarse. */
export async function resolveCityWithDensity(
  citySlug: string,
): Promise<{ citySlug: string; city: string; count: number } | null> {
  const cities = await listWorkshopCities();
  const match = cities.find((c) => c.citySlug === citySlug);
  if (!match || match.count < MIN_WORKSHOPS_PER_CITY) return null;
  return match;
}

/** ¿Existe un taller (cualquiera, activo) con este slug? */
export async function workshopSlugExists(slug: string): Promise<boolean> {
  const c = await prisma.company.findFirst({
    where: { slug: slug.trim().toLowerCase(), isActive: true },
    select: { id: true },
  });
  return c != null;
}

/** Slugs de talleres aprobados (para generateStaticParams / sitemap). */
export async function listApprovedWorkshopSlugs(): Promise<string[]> {
  const rows = await prisma.company.findMany({
    where: PUBLIC_WHERE,
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
