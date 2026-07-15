import {
  getPublicStorageUrl,
  isSupabaseStoragePath,
  localUploadUrlToStoragePath,
} from "@/lib/supabase/storage-config";

/** Resuelve la URL de una foto (absoluta, relativa o con base externa). */
export function resolvePhotoUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const legacyStoragePath = localUploadUrlToStoragePath(url);
  if (legacyStoragePath) {
    return getPublicStorageUrl(legacyStoragePath);
  }

  if (isSupabaseStoragePath(url)) {
    return getPublicStorageUrl(url);
  }

  const base =
    process.env.NEXT_PUBLIC_UPLOADS_BASE_URL?.replace(/\/$/, "") ?? "";
  if (base && url.startsWith("/")) return `${base}${url}`;

  return url;
}
