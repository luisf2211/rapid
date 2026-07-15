import { randomUUID } from "crypto";
import {
  getPublicStorageUrl,
  getSignaturesPrefix,
} from "@/lib/supabase/storage-config";
import {
  shouldUseSupabaseStorage,
  uploadStorageObject,
} from "@/lib/storage/images";

const MAX_SIGNATURE_BYTES = 2 * 1024 * 1024;

function parseSignaturePng(dataUrl: string): Buffer {
  const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl.trim());
  if (!match) {
    throw new Error("Formato de firma inválido");
  }

  const buffer = Buffer.from(match[1], "base64");
  if (buffer.length > MAX_SIGNATURE_BYTES) {
    throw new Error("La firma es demasiado grande");
  }

  return buffer;
}

export async function uploadSignaturePng(
  dataUrl: string,
): Promise<{ photoUrl: string; fileName: string; storagePath: string }> {
  const buffer = parseSignaturePng(dataUrl);
  const fileName = `${randomUUID()}.png`;
  const storagePath = `${getSignaturesPrefix()}/${fileName}`;

  const result = await uploadStorageObject(
    storagePath,
    buffer,
    "image/png",
    false,
  );

  return { photoUrl: result.photoUrl, fileName, storagePath: result.storagePath };
}

export { shouldUseSupabaseStorage } from "@/lib/storage/images";
