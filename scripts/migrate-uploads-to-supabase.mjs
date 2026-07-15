/*
  Sube imágenes locales (uploads/) a Supabase Storage y actualiza URLs en la BD.

  Carpetas locales → Storage:
    field       → recepcion/
    quotations  → cotizaciones/
    signatures  → firmas/
    workshop    → taller/

  Ejecutar:
    node scripts/migrate-uploads-to-supabase.mjs
*/

import { existsSync, readFileSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();

const SUBFOLDERS = [
  { local: "field", storage: process.env.SUPABASE_RECEPTION_PREFIX ?? "recepcion" },
  {
    local: "quotations",
    storage: process.env.SUPABASE_QUOTATIONS_PREFIX ?? "cotizaciones",
  },
  {
    local: "signatures",
    storage: process.env.SUPABASE_SIGNATURES_PREFIX ?? "firmas",
  },
  {
    local: "workshop",
    storage: process.env.SUPABASE_WORKSHOP_PREFIX ?? "taller",
  },
];

function loadEnvFile(fileName) {
  const path = join(root, fileName);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function contentTypeFromExtension(ext) {
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

loadEnvFile(".env");
loadEnvFile(".env.local");

const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "rapid";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables Supabase en .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const publicBase = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}`;
const urlMap = new Map();

async function uploadLocalFolder(localSubfolder, storagePrefix) {
  const localDir = join(root, "uploads", localSubfolder);
  if (!existsSync(localDir)) return 0;

  const files = (await readdir(localDir)).filter((f) => !f.startsWith("."));
  let count = 0;

  for (const fileName of files) {
    const storagePath = `${storagePrefix}/${fileName}`;
    const buffer = await readFile(join(localDir, fileName));
    const ext = fileName.split(".").pop() ?? "bin";

    const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
      contentType: contentTypeFromExtension(ext),
      upsert: true,
    });

    if (error) {
      console.error(`  ✗ ${localSubfolder}/${fileName}: ${error.message}`);
      continue;
    }

    const localUrl = `/uploads/${localSubfolder}/${fileName}`;
    const publicUrl = `${publicBase}/${storagePath}`;
    urlMap.set(localUrl, publicUrl);
    console.log(`  ✓ ${localUrl} → ${publicUrl}`);
    count++;
  }

  return count;
}

async function replaceUrl(value) {
  if (!value) return value;
  if (urlMap.has(value)) return urlMap.get(value);
  return value;
}

async function updateDatabaseUrls(prisma) {
  let updated = 0;

  for (const row of await prisma.quotationPhoto.findMany({
    select: { id: true, photoUrl: true },
  })) {
    const next = await replaceUrl(row.photoUrl);
    if (next !== row.photoUrl) {
      await prisma.quotationPhoto.update({
        where: { id: row.id },
        data: { photoUrl: next },
      });
      updated++;
    }
  }

  for (const row of await prisma.workOrderPhoto.findMany({
    select: { id: true, photoUrl: true },
  })) {
    const next = await replaceUrl(row.photoUrl);
    if (next !== row.photoUrl) {
      await prisma.workOrderPhoto.update({
        where: { id: row.id },
        data: { photoUrl: next },
      });
      updated++;
    }
  }

  for (const row of await prisma.workOrderReception.findMany({
    select: { id: true, customerReceivedSignature: true },
  })) {
    const next = await replaceUrl(row.customerReceivedSignature);
    if (next !== row.customerReceivedSignature) {
      await prisma.workOrderReception.update({
        where: { id: row.id },
        data: { customerReceivedSignature: next },
      });
      updated++;
    }
  }

  for (const row of await prisma.workshopSettings.findMany({
    select: { id: true, logoUrl: true, stampUrl: true },
  })) {
    const logoUrl = await replaceUrl(row.logoUrl);
    const stampUrl = await replaceUrl(row.stampUrl);
    if (logoUrl !== row.logoUrl || stampUrl !== row.stampUrl) {
      await prisma.workshopSettings.update({
        where: { id: row.id },
        data: { logoUrl, stampUrl },
      });
      updated++;
    }
  }

  return updated;
}

async function main() {
  console.log(`Subiendo archivos al bucket "${bucket}"…\n`);

  let total = 0;
  for (const { local, storage } of SUBFOLDERS) {
    console.log(`[${local} → ${storage}]`);
    total += await uploadLocalFolder(local, storage);
    console.log("");
  }

  console.log(`Archivos subidos: ${total}`);

  const prisma = new PrismaClient();
  try {
    const updated = await updateDatabaseUrls(prisma);
    console.log(`Registros de BD actualizados: ${updated}`);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\nMigración de imágenes completada.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
