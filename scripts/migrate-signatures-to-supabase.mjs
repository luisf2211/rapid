/*
  Sube firmas locales (uploads/signatures/) al bucket Supabase `rapid/firmas/`.

  Ejecutar:
    node scripts/migrate-signatures-to-supabase.mjs
*/

import { readFileSync, existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { createClient } from "@supabase/supabase-js";
import { join } from "path";

const root = process.cwd();

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

loadEnvFile(".env");
loadEnvFile(".env.local");
const localDir = join(root, "uploads/signatures");
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "rapid";
const prefix = process.env.SUPABASE_SIGNATURES_PREFIX ?? "firmas";
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

async function main() {
  const files = (await readdir(localDir)).filter((f) => f.endsWith(".png"));
  if (!files.length) {
    console.log("No hay firmas locales en uploads/signatures/");
    return;
  }

  console.log(`Subiendo ${files.length} firma(s) a ${bucket}/${prefix}/ …`);

  for (const fileName of files) {
    const storagePath = `${prefix}/${fileName}`;
    const buffer = await readFile(join(localDir, fileName));

    const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

    if (error) {
      console.error(`  ✗ ${fileName}: ${error.message}`);
      continue;
    }

    console.log(`  ✓ ${fileName} → ${publicBase}/${storagePath}`);
  }

  console.log("\nMigración de firmas completada.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
