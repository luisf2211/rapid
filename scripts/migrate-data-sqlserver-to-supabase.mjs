/*
  Exporta datos desde SQL Server e importa a Supabase (PostgreSQL).

  Requisitos en .env.local:
    SQLSERVER_DATABASE_URL — conexión SQL Server (origen)
    DATABASE_URL — PostgreSQL Supabase (destino)

  Ejecutar:
    node scripts/migrate-data-sqlserver-to-supabase.mjs
*/

import { execSync } from "child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const exportPath = join(root, "scripts/.migration-export.json");
const postgresSchema = join(root, "prisma/schema.postgresql.prisma");
const activeSchema = join(root, "prisma/schema.prisma");
const backupSchema = join(root, "prisma/schema.sqlserver.prisma");

const BASE_IMPORT_ORDER = [
  "company",
  "user",
  "workshopSettings",
  "employee",
  "payrollPeriod",
];

const IMPORT_ORDER = [
  "inventoryPart",
  "workOrderReception",
  "workOrderReceptionChecklist",
  "workOrderPhoto",
  "workOrderDamage",
  "inventoryMovement",
  "materialRequisition",
  "materialRequisitionItem",
  "laborOrder",
  "laborOrderItem",
  "quotationLaborLine",
  "quotationMaterialLine",
  "quotationPartLine",
  "quotationDamage",
  "quotationPhoto",
  "invoice",
  "invoiceLine",
  "employeePayment",
  "employeePaymentWorkLine",
  "payrollLine",
  "payrollSettlement",
  "auditLog",
];

const TRUNCATE_TABLES = [
  "AuditLog",
  "PayrollSettlement",
  "PayrollLine",
  "EmployeePaymentWorkLine",
  "EmployeePayment",
  "InvoiceLine",
  "Invoice",
  "QuotationPhoto",
  "QuotationDamage",
  "QuotationPartLine",
  "QuotationMaterialLine",
  "QuotationLaborLine",
  "LaborOrderItem",
  "LaborOrder",
  "MaterialRequisitionItem",
  "MaterialRequisition",
  "InventoryMovement",
  "WorkOrderDamage",
  "WorkOrderPhoto",
  "WorkOrderReceptionChecklist",
  "WorkOrderReception",
  "InventoryPart",
  "WorkOrder",
  "Quotation",
  "PayrollPeriod",
  "Employee",
  "WorkshopSettings",
  "User",
  "Company",
];

const SEQUENCE_TABLES = [
  ["Company", "Id"],
  ["User", "Id"],
  ["WorkshopSettings", "Id"],
  ["Employee", "Id"],
  ["PayrollPeriod", "Id"],
  ["WorkOrder", "Id"],
  ["InventoryPart", "Id"],
  ["WorkOrderReception", "Id"],
  ["WorkOrderReceptionChecklist", "Id"],
  ["WorkOrderPhoto", "Id"],
  ["WorkOrderDamage", "Id"],
  ["InventoryMovement", "Id"],
  ["MaterialRequisition", "Id"],
  ["MaterialRequisitionItem", "Id"],
  ["LaborOrder", "Id"],
  ["LaborOrderItem", "Id"],
  ["Quotation", "Id"],
  ["QuotationLaborLine", "Id"],
  ["QuotationMaterialLine", "Id"],
  ["QuotationPartLine", "Id"],
  ["QuotationDamage", "Id"],
  ["QuotationPhoto", "Id"],
  ["Invoice", "Id"],
  ["InvoiceLine", "Id"],
  ["EmployeePayment", "Id"],
  ["EmployeePaymentWorkLine", "Id"],
  ["PayrollLine", "Id"],
  ["PayrollSettlement", "Id"],
  ["AuditLog", "Id"],
];

function loadEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
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

function serializeValue(_key, value) {
  if (value !== null && typeof value === "object") {
    if (typeof value.toJSON === "function") return value.toJSON();
    if (value instanceof Date) return value.toISOString();
  }
  return value;
}

async function exportFromSqlServer() {
  const postgresUrl = process.env.DATABASE_URL;
  const sourceUrl =
    process.env.SQLSERVER_DATABASE_URL ?? postgresUrl;
  if (!sourceUrl?.startsWith("sqlserver://")) {
    throw new Error(
      "SQLSERVER_DATABASE_URL debe apuntar a SQL Server (sqlserver://…)",
    );
  }

  if (!existsSync(backupSchema)) {
    copyFileSync(activeSchema, backupSchema);
  }

  process.env.DATABASE_URL = sourceUrl;
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const payload = {};

  try {
    for (const model of IMPORT_ORDER) {
      const rows = await prisma[model].findMany();
      payload[model] = rows;
      if (rows.length > 0) {
        console.log(`  export ${model}: ${rows.length}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  writeFileSync(exportPath, JSON.stringify(payload, serializeValue, 2));
  console.log(`Export guardado en ${exportPath}`);

  if (postgresUrl?.startsWith("postgresql://")) {
    process.env.DATABASE_URL = postgresUrl;
  }
}

async function applyPostgresSchema() {
  if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL debe ser PostgreSQL (Supabase).");
  }

  copyFileSync(postgresSchema, activeSchema);
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });
}

async function importToSupabase() {
  const raw = readFileSync(exportPath, "utf8");
  const payload = JSON.parse(raw);
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${TRUNCATE_TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`,
    );

    for (const model of BASE_IMPORT_ORDER) {
      const rows = payload[model];
      if (!rows?.length) continue;
      await prisma[model].createMany({ data: rows, skipDuplicates: true });
      console.log(`  import ${model}: ${rows.length}`);
    }

    const quotations = payload.quotation ?? [];
    const workOrders = payload.workOrder ?? [];

    if (quotations.length) {
      await prisma.quotation.createMany({
        data: quotations.map(({ workOrderId: _workOrderId, ...row }) => row),
        skipDuplicates: true,
      });
      console.log(`  import quotation: ${quotations.length}`);
    }

    if (workOrders.length) {
      await prisma.workOrder.createMany({
        data: workOrders,
        skipDuplicates: true,
      });
      console.log(`  import workOrder: ${workOrders.length}`);
    }

    for (const row of quotations) {
      if (row.workOrderId == null) continue;
      await prisma.quotation.update({
        where: { id: row.id },
        data: { workOrderId: row.workOrderId },
      });
    }

    for (const model of IMPORT_ORDER) {
      const rows = payload[model];
      if (!rows?.length) continue;
      await prisma[model].createMany({ data: rows, skipDuplicates: true });
      console.log(`  import ${model}: ${rows.length}`);
    }

    for (const [table, column] of SEQUENCE_TABLES) {
      await prisma.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('"${table}"', '${column}'),
          COALESCE((SELECT MAX("${column}") FROM "${table}"), 1),
          true
        );
      `);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyImport() {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const allModels = [
    "company",
    "user",
    "workshopSettings",
    "employee",
    "payrollPeriod",
    "workOrder",
    "inventoryPart",
    "workOrderReception",
    "workOrderReceptionChecklist",
    "workOrderPhoto",
    "workOrderDamage",
    "inventoryMovement",
    "materialRequisition",
    "materialRequisitionItem",
    "laborOrder",
    "laborOrderItem",
    "quotation",
    "quotationLaborLine",
    "quotationMaterialLine",
    "quotationPartLine",
    "quotationDamage",
    "quotationPhoto",
    "invoice",
    "invoiceLine",
    "employeePayment",
    "employeePaymentWorkLine",
    "payrollLine",
    "payrollSettlement",
    "auditLog",
  ];
  try {
    console.log("\nVerificación en Supabase:");
    for (const model of allModels) {
      const count = await prisma[model].count();
      if (count > 0) console.log(`  ${model}: ${count}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

loadEnvLocal();

const skipExport = process.argv.includes("--import-only");

if (!skipExport) {
  console.log("1/4 Exportando desde SQL Server…");
  await exportFromSqlServer();
} else {
  console.log("1/4 Export omitido (--import-only)…");
}

console.log("\n2/4 Aplicando schema PostgreSQL en Supabase…");
await applyPostgresSchema();

console.log("\n3/4 Importando datos…");
await importToSupabase();

console.log("\n4/4 Verificando…");
await verifyImport();

console.log("\nMigración de datos completada.");
