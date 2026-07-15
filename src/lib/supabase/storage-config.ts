import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

const DEFAULT_PREFIX_BY_SUBFOLDER: Record<string, string> = {
  field: "recepcion",
  quotations: "cotizaciones",
  signatures: "firmas",
  workshop: "taller",
};

/** Cliente server-side para Storage (usa publishable key + políticas del bucket). */
export function createAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y credenciales Supabase en el entorno.",
    );
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "rapid";
}

export function getSignaturesPrefix(): string {
  return process.env.SUPABASE_SIGNATURES_PREFIX ?? "firmas";
}

export function getStoragePrefixForSubfolder(subfolder: string): string {
  const envKey = `SUPABASE_${subfolder.toUpperCase().replace(/-/g, "_")}_PREFIX`;
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv;

  if (subfolder === "quotations") {
    return process.env.SUPABASE_QUOTATIONS_PREFIX ?? "cotizaciones";
  }
  if (subfolder === "field") {
    return process.env.SUPABASE_RECEPTION_PREFIX ?? "recepcion";
  }
  if (subfolder === "signatures") {
    return getSignaturesPrefix();
  }
  if (subfolder === "workshop") {
    return process.env.SUPABASE_WORKSHOP_PREFIX ?? "taller";
  }

  return DEFAULT_PREFIX_BY_SUBFOLDER[subfolder] ?? subfolder;
}

export function getAllStoragePrefixes(): string[] {
  return [
    getStoragePrefixForSubfolder("field"),
    getStoragePrefixForSubfolder("quotations"),
    getStoragePrefixForSubfolder("signatures"),
    getStoragePrefixForSubfolder("workshop"),
  ];
}

/** Convierte `/uploads/quotations/foo.jpg` → `cotizaciones/foo.jpg`. */
export function localUploadUrlToStoragePath(photoUrl: string): string | null {
  const match = /^\/uploads\/([^/]+)\/(.+)$/.exec(photoUrl.trim());
  if (!match) return null;
  const [, subfolder, fileName] = match;
  return `${getStoragePrefixForSubfolder(subfolder)}/${fileName}`;
}

/** URL pública de un objeto en Storage (bucket público). */
export function getPublicStorageUrl(objectPath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const bucket = getStorageBucket();
  const path = objectPath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function isSupabaseStoragePath(value: string): boolean {
  if (
    value.includes("/storage/v1/object/public/") ||
    value.includes("/storage/v1/object/sign/")
  ) {
    return true;
  }

  return getAllStoragePrefixes().some((prefix) => value.startsWith(`${prefix}/`));
}

export function isSupabaseStorageEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_STORAGE_ENABLED !== "false",
  );
}

export function contentTypeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
