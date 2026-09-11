import type { MetadataRoute } from "next";
import { listApprovedWorkshopSlugs } from "@/services/workshops-directory.service";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rapidcar.app"
).replace(/\/$/, "");

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cotizar`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/registrar-taller`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/talleres`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/rastrear`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Perfil público de cada taller aprobado (SEO local).
  try {
    const slugs = await listApprovedWorkshopSlugs();
    for (const slug of slugs) {
      base.push({
        url: `${SITE_URL}/talleres/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      base.push({
        url: `${SITE_URL}/cotizar/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    /* sin BD: sitemap con las rutas base */
  }

  return base;
}
