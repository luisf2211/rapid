import {
  contentTypeFromExtension,
  createAdminClient,
  getPublicStorageUrl,
  getStorageBucket,
  isSupabaseStorageEnabled,
} from "@/lib/supabase/storage-config";

export async function uploadStorageObject(
  storagePath: string,
  body: Buffer,
  contentType: string,
  upsert = false,
): Promise<{ photoUrl: string; storagePath: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(getStorageBucket())
    .upload(storagePath, body, {
      contentType,
      upsert,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    photoUrl: getPublicStorageUrl(storagePath),
    storagePath,
  };
}

export async function uploadStorageFile(
  storagePath: string,
  body: Buffer,
  upsert = true,
): Promise<{ photoUrl: string; storagePath: string }> {
  const ext = storagePath.split(".").pop() ?? "bin";
  return uploadStorageObject(
    storagePath,
    body,
    contentTypeFromExtension(ext),
    upsert,
  );
}

export function shouldUseSupabaseStorage(): boolean {
  return isSupabaseStorageEnabled();
}
