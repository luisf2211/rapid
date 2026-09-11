import type { Metadata } from "next";
import { SITE_NAME, SITE_LOCALE, DEFAULT_OG_IMAGE, absoluteUrl } from "./config";

type BuildMetadataArgs = {
  title: string;
  description: string;
  /** Ruta canónica relativa, ej. "/cotizar". */
  path?: string;
  keywords?: string[];
  /** Imagen OG relativa o absoluta. */
  ogImage?: string;
  /** Marcar noindex para páginas privadas (dashboard, checkout, etc.). */
  noindex?: boolean;
  type?: "website" | "article";
};

/**
 * Construye metadata de Next.js consistente por página:
 * title, description, canonical, Open Graph, Twitter y robots.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  type = "website",
}: BuildMetadataArgs): Metadata {
  const canonical = absoluteUrl(path);
  const image = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      locale: SITE_LOCALE,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
  };
}
