import type { MetadataRoute } from "next";
import { listPublicWorkshops } from "@/services/public-quotations.service";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rapidcar.app"
).replace(/\/$/, "");

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cotizar`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/rastrear`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  // Página de cada taller público (buena para SEO local).
  try {
    const workshops = await listPublicWorkshops();
    for (const w of workshops) {
      base.push({
        url: `${SITE_URL}/cotizar/${w.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    /* sin BD: sitemap con las rutas base */
  }

  return base;
}
