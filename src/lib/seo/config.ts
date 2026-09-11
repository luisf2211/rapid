/**
 * Configuración central de SEO y datos de marca para Rapid.
 * Fuente única de verdad para URLs, nombre, y metadata por defecto.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rapidcar.app"
).replace(/\/$/, "");

export const SITE_NAME = "Rapid";

export const SITE_LOCALE = "es_DO";

export const DEFAULT_OG_IMAGE = "/og/default.png";

/** Contacto y redes (para Organization schema y footer). */
export const BRAND = {
  name: SITE_NAME,
  url: SITE_URL,
  email: "reyesbaezluisfelipe@gmail.com",
  whatsapp: "18295082211",
  whatsappDisplay: "829-508-2211",
  description:
    "Rapid conecta a propietarios de vehículos con talleres de pintura automotriz y detailing, y da a los talleres el software para gestionar su operación.",
} as const;

/** Absolutiza una ruta relativa contra SITE_URL. */
export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
