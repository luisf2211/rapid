import { mkdir, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { randomUUID } from "crypto";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function getUploadsRoot(): string {
  const dir = process.env.UPLOADS_DIR ?? "./uploads";
  return resolve(process.cwd(), dir);
}

export async function saveUploadedImage(
  file: File,
  subfolder = "field",
): Promise<{ photoUrl: string; fileName: string }> {
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 10 MB");
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  const ext = rawExt === "jpeg" ? "jpg" : rawExt;
  if (!ALLOWED_EXT.has(rawExt) && !ALLOWED_EXT.has(ext)) {
    throw new Error("Formato no permitido. Usa JPG, PNG, WEBP o GIF.");
  }

  const fileName = `${randomUUID()}.${ext || "jpg"}`;
  const dir = join(getUploadsRoot(), subfolder);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, fileName), buffer);

  return {
    photoUrl: `/uploads/${subfolder}/${fileName}`,
    fileName,
  };
}
