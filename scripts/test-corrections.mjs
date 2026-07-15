/*
  Test de validación E2E a nivel de servicio.
  Verifica las correcciones del plan de bugs contra la BD real.

  Ejecutar:
    node scripts/test-corrections.mjs
*/

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_EMAIL = "reyesbaezluisfelipe@gmail.com";
const TEST_PASSWORD = "Prueba123";

let passed = 0;
let failed = 0;

function ok(msg) {
  passed++;
  console.log(`  ✅ ${msg}`);
}

function fail(msg, detail) {
  failed++;
  console.log(`  ❌ ${msg}`);
  if (detail) console.log(`     → ${detail}`);
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log(" Test de correcciones — RapidCar");
  console.log("═══════════════════════════════════════════════════════\n");

  // ─── 1. Verificar usuario y empresa ───
  console.log("▶ Test 1: Verificar usuario de prueba");
  const user = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
    include: { company: true },
  });

  if (!user) {
    fail("Usuario no encontrado", `No existe usuario con email ${TEST_EMAIL}`);
    console.log("\n⚠️  No se puede continuar sin usuario. Abortando.\n");
    return;
  }

  ok(`Usuario encontrado — ${user.fullName || user.email} (role: ${user.role})`);

  const companyId = user.companyId;
  if (!companyId) {
    fail("Usuario sin empresa asignada");
    return;
  }
  ok(`Empresa: ${user.company.name} (ID: ${companyId})`);

  // ─── 2. Test Item 5: exitDate/exitTime en recepción ───
  console.log("\n▶ Test 2: Fecha estimada de entrega (Item 5)");
  console.log("  Creando orden de trabajo con exitDate/exitTime...");

  const orderNumber = 99900 + Math.floor(Math.random() * 100);
  const testExitDate = new Date("2026-07-15T00:00:00.000Z");
  const testExitTime = new Date("1970-01-01T14:30:00.000Z");

  const testOrder = await prisma.workOrder.create({
    data: {
      orderNumber,
      CompanyId: companyId,
      status: "RECEIVED",
      customerName: "Cliente Test E2E",
      brand: "Toyota",
      model: "Corolla",
      vehicleYear: 2024,
      color: "Blanco",
      plate: "TEST001",
      notes: "Nota interna de prueba — NO debe aparecer en print",
      receptions: {
        create: {
          deliveryDate: new Date("2026-07-04T00:00:00.000Z"),
          deliveryTime: new Date("1970-01-01T09:00:00.000Z"),
          exitDate: testExitDate,
          exitTime: testExitTime,
          fuelLevel: "HALF",
          receivedBy: "Tester Automatizado",
          observations: "Observación visible al cliente",
          requestedDamages: "Daño lateral derecho",
        },
      },
    },
    include: {
      receptions: true,
    },
  });

  if (testOrder.receptions[0]?.exitDate) {
    const savedDate = testOrder.receptions[0].exitDate;
    if (savedDate.toISOString().startsWith("2026-07-15")) {
      ok("exitDate se persiste correctamente (2026-07-15)");
    } else {
      fail("exitDate con valor inesperado", savedDate.toISOString());
    }
  } else {
    fail("exitDate no se guardó en la recepción");
  }

  if (testOrder.receptions[0]?.exitTime) {
    const savedTime = testOrder.receptions[0].exitTime;
    const hours = savedTime.getUTCHours();
    const mins = savedTime.getUTCMinutes();
    if (hours === 14 && mins === 30) {
      ok("exitTime se persiste correctamente (14:30)");
    } else {
      fail("exitTime con valor inesperado", `${hours}:${mins}`);
    }
  } else {
    fail("exitTime no se guardó en la recepción");
  }

  // Verificar update
  const updatedReception = await prisma.workOrderReception.update({
    where: { id: testOrder.receptions[0].id },
    data: {
      exitDate: new Date("2026-07-20T00:00:00.000Z"),
      exitTime: new Date("1970-01-01T16:00:00.000Z"),
    },
  });

  if (updatedReception.exitDate?.toISOString().startsWith("2026-07-20")) {
    ok("exitDate se actualiza correctamente en update");
  } else {
    fail("exitDate no se actualizó correctamente");
  }

  // ─── 3. Test Item 15: Nuevos campos checklist ───
  console.log("\n▶ Test 3: Nuevos ítems de checklist (Item 15)");

  const newChecklistItems = [
    { name: "ALFOMBRAS (TELA)", field: "carpetsFabric" },
    { name: "ALFOMBRAS (GOMA)", field: "carpetsRubber" },
    { name: "RADAR", field: "radar" },
    { name: "SENSORES DE PARQUEO", field: "parkingSensors" },
    { name: "CÁMARA TRASERA", field: "rearCamera" },
  ];

  const receptionId = testOrder.receptions[0].id;
  let checklistOk = true;

  for (const item of newChecklistItems) {
    try {
      await prisma.workOrderReceptionChecklist.create({
        data: {
          workOrderReceptionId: receptionId,
          itemName: item.name,
          isChecked: true,
          hasComment: true,
          comments: `Test E2E — ${item.field}`,
        },
      });
    } catch (e) {
      fail(`No se pudo crear checklist item "${item.name}"`, e.message);
      checklistOk = false;
    }
  }

  if (checklistOk) {
    ok("Los 5 nuevos ítems de checklist se guardan en BD correctamente");
  }

  // Verificar lectura
  const savedChecklist = await prisma.workOrderReceptionChecklist.findMany({
    where: { workOrderReceptionId: receptionId },
  });

  const savedNames = savedChecklist.map((c) => c.itemName);
  const allFound = newChecklistItems.every((item) => savedNames.includes(item.name));
  if (allFound && savedChecklist.length === 5) {
    ok(`Checklist items recuperados correctamente (${savedChecklist.length} ítems)`);
  } else {
    fail("Algunos ítems no se recuperaron", `Encontrados: ${savedNames.join(", ")}`);
  }

  // ─── 4. Test Item 10: Body size limit (validación estática) ───
  console.log("\n▶ Test 4: Body size limit (Item 10)");
  const fs = await import("fs");
  const nextConfig = fs.readFileSync("next.config.ts", "utf-8");
  if (nextConfig.includes("bodySizeLimit") && nextConfig.includes("10mb")) {
    ok("next.config.ts tiene bodySizeLimit: '10mb' configurado");
  } else {
    fail("next.config.ts no tiene bodySizeLimit configurado");
  }

  // ─── 5. Test Item 3: print-color-adjust (validación estática) ───
  console.log("\n▶ Test 5: CSS print-color-adjust (Item 3)");
  const receptionCss = fs.readFileSync("src/app/print/reception-print.css", "utf-8");
  if (receptionCss.includes("print-color-adjust: exact") &&
      receptionCss.includes("-webkit-print-color-adjust: exact")) {
    ok("reception-print.css tiene print-color-adjust: exact en .idoc-check-box.on");
  } else {
    fail("reception-print.css NO tiene print-color-adjust: exact");
  }

  // ─── 6. Test Item 4: Notas internas NO en print ───
  console.log("\n▶ Test 6: Notas internas excluidas del print (Item 4)");
  const receptionDoc = fs.readFileSync(
    "src/components/work-order/print/ReceptionOrderDocument.tsx",
    "utf-8"
  );
  if (!receptionDoc.includes("data.notes") && !receptionDoc.includes("internalNotes")) {
    ok("ReceptionOrderDocument.tsx NO renderiza notas internas");
  } else {
    fail("ReceptionOrderDocument.tsx aún referencia notas internas");
  }

  // ─── 7. Test Item 1: Scroll preservation (validación estática) ───
  console.log("\n▶ Test 7: Scroll preservation (Item 1)");
  const quotForm = fs.readFileSync(
    "src/app/(app)/quotations/new/NewQuotationForm.tsx",
    "utf-8"
  );
  const reqForm = fs.readFileSync(
    "src/app/(app)/material-requisitions/new/NewMaterialRequisitionForm.tsx",
    "utf-8"
  );
  const laborForm = fs.readFileSync(
    "src/components/labor-order/LaborOrderForm.tsx",
    "utf-8"
  );
  const invoiceForm = fs.readFileSync(
    "src/app/(app)/invoices/[id]/edit/EditInvoiceForm.tsx",
    "utf-8"
  );

  const scrollFiles = [
    { name: "NewQuotationForm", content: quotForm },
    { name: "NewMaterialRequisitionForm", content: reqForm },
    { name: "LaborOrderForm", content: laborForm },
    { name: "EditInvoiceForm", content: invoiceForm },
  ];

  for (const { name, content } of scrollFiles) {
    if (content.includes("appendPreservingScroll")) {
      ok(`${name} usa appendPreservingScroll`);
    } else {
      fail(`${name} NO tiene scroll preservation`);
    }
  }

  // ─── 8. Test validación Zod exitDate ───
  console.log("\n▶ Test 8: Schema Zod incluye exitDate/exitTime");
  const workOrderSchema = fs.readFileSync(
    "src/lib/validations/work-order.ts",
    "utf-8"
  );
  if (workOrderSchema.includes("exitDate") && workOrderSchema.includes("exitTime")) {
    ok("work-order.ts schema incluye exitDate y exitTime");
  } else {
    fail("work-order.ts NO incluye exitDate/exitTime");
  }

  // ─── 9. Requisición grande (simular N líneas) ───
  console.log("\n▶ Test 9: Requisición con 50+ materiales (Item 10)");

  // Buscar una orden existente para la requisición
  const existingOrder = await prisma.workOrder.findFirst({
    where: { CompanyId: companyId },
    select: { id: true, orderNumber: true },
    orderBy: { id: "desc" },
  });

  if (existingOrder) {
    try {
      const reqLines = [];
      for (let i = 0; i < 60; i++) {
        reqLines.push({
          partName: `Material de prueba ${i + 1}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          unitCost: parseFloat((Math.random() * 100 + 10).toFixed(2)),
          lineType: "MATERIAL",
        });
      }

      const requisition = await prisma.materialRequisition.create({
        data: {
          CompanyId: companyId,
          workOrderId: existingOrder.id,
          requestedBy: "Tester E2E",
          status: "PENDING",
          items: { create: reqLines },
        },
        include: { _count: { select: { items: true } } },
      });

      if (requisition._count.items === 60) {
        ok(`Requisición con 60 materiales creada exitosamente (ID: ${requisition.id})`);
      } else {
        fail("Requisición creada pero con conteo incorrecto", `${requisition._count.items}/60`);
      }

      // Cleanup requisición de test
      await prisma.materialRequisitionItem.deleteMany({
        where: { materialRequisitionId: requisition.id },
      });
      await prisma.materialRequisition.delete({ where: { id: requisition.id } });
      ok("Cleanup de requisición de prueba completado");
    } catch (e) {
      fail("Error al crear requisición grande", e.message);
    }
  } else {
    fail("No hay órdenes existentes para probar requisición");
  }

  // ─── Cleanup ───
  console.log("\n▶ Cleanup");
  try {
    await prisma.workOrderReceptionChecklist.deleteMany({
      where: { workOrderReceptionId: receptionId },
    });
    await prisma.workOrderReception.delete({ where: { id: receptionId } });
    await prisma.workOrder.delete({ where: { id: testOrder.id } });
    ok("Orden de trabajo de prueba eliminada");
  } catch (e) {
    fail("Error limpiando datos de test", e.message);
  }

  // ─── Resumen ───
  console.log("\n═══════════════════════════════════════════════════════");
  console.log(` Resultados: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════════\n");

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error("Error fatal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
