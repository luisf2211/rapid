/** Resuelve la URL de una foto (absoluta, relativa o con base externa). */
export function resolvePhotoUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const base =
    process.env.NEXT_PUBLIC_UPLOADS_BASE_URL?.replace(/\/$/, "") ?? "";
  if (base && url.startsWith("/")) return `${base}${url}`;

  // Rutas /uploads/... las sirve la app vía route handler si UPLOADS_DIR está configurado
  return url;
}
