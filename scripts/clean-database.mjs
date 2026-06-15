/*
  Limpia TODOS los datos operativos y empresas/usuarios de taller.
  Conserva únicamente el administrador de plataforma (admin@rapid.local).

  Ejecutar:
    node scripts/clean-database.mjs
*/

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const PLATFORM_ADMIN_EMAIL = "admin@rapid.local";
const PLATFORM_ADMIN_PASSWORD = "123";

const prisma = new PrismaClient();

async function run(sql) {
  await prisma.$executeRawUnsafe(sql);
}

async function main() {
  console.log("Limpiando base de datos…");

  await run("UPDATE dbo.WorkOrder SET QuotationId = NULL WHERE QuotationId IS NOT NULL");
  await run("UPDATE dbo.Quotation SET WorkOrderId = NULL WHERE WorkOrderId IS NOT NULL");
  await run("UPDATE dbo.EmployeePayment SET DeductedInSettlementId = NULL, PayrollSettlementId = NULL");

  const tables = [
    "EmployeePaymentWorkLine",
    "PayrollLine",
    "EmployeePayment",
    "PayrollSettlement",
    "MaterialRequisitionItem",
    "MaterialRequisition",
    "InventoryMovement",
    "LaborOrderItem",
    "LaborOrder",
    "InvoiceLine",
    "Invoice",
    "QuotationLaborLine",
    "QuotationMaterialLine",
    "QuotationPartLine",
    "QuotationDamage",
    "QuotationPhoto",
    "Quotation",
    "WorkOrderReceptionChecklist",
    "WorkOrderReception",
    "WorkOrderDamage",
    "WorkOrderPhoto",
    "WorkOrder",
    "InventoryPart",
    "Employee",
    "PayrollPeriod",
    "WorkshopSettings",
    "AuditLog",
    "[User]",
    "Company",
  ];

  for (const table of tables) {
    try {
      await run(`DELETE FROM dbo.${table}`);
      console.log(`  ✓ ${table}`);
    } catch (e) {
      console.warn(`  · ${table} (${e.message})`);
    }
  }

  const hash = await bcrypt.hash(PLATFORM_ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: PLATFORM_ADMIN_EMAIL,
      passwordHash: hash,
      fullName: "Administrador plataforma",
      role: "PLATFORM_ADMIN",
      companyId: null,
      isActive: true,
    },
  });

  console.log("\nListo. Solo queda el admin de plataforma:");
  console.log(`  Correo: admin  o  ${PLATFORM_ADMIN_EMAIL}`);
  console.log(`  Contraseña: ${PLATFORM_ADMIN_PASSWORD}`);
  console.log("\nFlujo de prueba:");
  console.log("  1. Login admin → /admin");
  console.log("  2. Crear empresa (se crea usuario admin del taller)");
  console.log("  3. Login con ese usuario → solo ve datos de su empresa");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
