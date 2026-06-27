/*
  Migración única a Supabase: aplica schema PostgreSQL y seed del admin.

  Requisitos:
    - DATABASE_URL apuntando a Supabase (conexión directa, puerto 5432)
    - .env con AUTH_SECRET y demás variables de la app

  Ejecutar:
    node scripts/migrate-to-supabase.mjs
*/

import { execSync } from "child_process";
import { copyFileSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const postgresSchema = join(root, "prisma/schema.postgresql.prisma");
const activeSchema = join(root, "prisma/schema.prisma");
const backupSchema = join(root, "prisma/schema.sqlserver.prisma");

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en el entorno (.env).");
  process.exit(1);
}

if (!process.env.DATABASE_URL.startsWith("postgresql://")) {
  console.error(
    "DATABASE_URL debe ser PostgreSQL (Supabase). Ejemplo:\n" +
      '  postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres',
  );
  process.exit(1);
}

if (!existsSync(postgresSchema)) {
  console.error("No se encontró prisma/schema.postgresql.prisma");
  process.exit(1);
}

console.log("1/4 Respaldo del schema SQL Server…");
if (!existsSync(backupSchema)) {
  copyFileSync(activeSchema, backupSchema);
  console.log("   Guardado en prisma/schema.sqlserver.prisma");
} else {
  console.log("   prisma/schema.sqlserver.prisma ya existe (sin cambios).");
}

console.log("2/4 Activando schema PostgreSQL…");
copyFileSync(postgresSchema, activeSchema);

console.log("3/4 Aplicando schema a Supabase (prisma db push)…");
execSync("npx prisma db push --accept-data-loss", {
  stdio: "inherit",
  env: process.env,
});

console.log("4/4 Regenerando cliente y seed del admin…");
execSync("npx prisma generate", { stdio: "inherit", env: process.env });
execSync("node scripts/supabase-seed.mjs", { stdio: "inherit", env: process.env });

console.log("\nMigración completada. Tablas creadas en Supabase.");
