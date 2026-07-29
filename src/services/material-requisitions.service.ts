import { prisma } from "@/lib/prisma";
import { INVENTORY_MOVEMENT_TYPES, MATERIAL_REQUISITION_LINE_TYPES } from "@/lib/constants";
import { formatRequisitionProductName } from "@/lib/material-requisition";
import {
  applyInventoryMovement,
  availableQuantity,
} from "@/services/inventory.service";
import type { MaterialRequisitionInput } from "@/lib/validations/material-requisition";
import { INVENTORY_PART_TYPES } from "@/lib/constants";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { requisitionLineTotal } from "@/lib/material-requisition/line-total";

export async function listMaterialRequisitions(params?: {
  workOrderId?: number;
}) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.materialRequisition.findMany({
    where: {
      workOrder: companyWhere(companyId),
      ...(params?.workOrderId ? { workOrderId: params.workOrderId } : {}),
    },
    include: {
      workOrder: true,
      items: true,
    },
    orderBy: { id: "desc" },
  });
}

export async function getMaterialRequisitionById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.materialRequisition.findFirst({
    where: { id, workOrder: companyWhere(companyId) },
    include: {
      workOrder: true,
      items: true,
    },
  });
}

type RequisitionLineInput = MaterialRequisitionInput["materialItems"][number];

function buildRequisitionLines(
  items: RequisitionLineInput[],
  lineType: "MATERIAL" | "PAINT",
  partMap: Map<number, { sku: string; name: string; unit: string; PartType: string }>,
) {
  return items.map((it) => {
    const part = partMap.get(it.inventoryPartId)!;
    const expectedType =
      lineType === MATERIAL_REQUISITION_LINE_TYPES.PAINT
        ? INVENTORY_PART_TYPES.PAINT
        : INVENTORY_PART_TYPES.MATERIAL;
    if (part.PartType !== expectedType) {
      throw new Error(
        `${part.name} no pertenece al inventario de ${lineType === MATERIAL_REQUISITION_LINE_TYPES.PAINT ? "pintura" : "materiales"}`,
      );
    }
    const qty = Number(it.quantity);
    const price = Number(it.unitPrice);
    return {
      productName: formatRequisitionProductName(part.sku, part.name),
      quantity: qty,
      unitPrice: price,
      total: requisitionLineTotal(lineType, qty, price),
      assignedEmployee: it.assignedEmployee || null,
      inventoryPartId: it.inventoryPartId,
      lineType,
      unit: part.unit,
    };
  });
}

export async function createMaterialRequisition(
  input: MaterialRequisitionInput,
) {
  return prisma.$transaction(
    async (tx) => {
    const companyId = await requireCompanyIdFromSession();
    const workOrder = await tx.workOrder.findFirst({
      where: { id: input.workOrderId, CompanyId: companyId },
    });
    if (!workOrder) {
      throw new Error("Orden de recepción no encontrada en tu empresa");
    }

    const allInputItems = [
      ...input.materialItems.map((it) => ({
        ...it,
        lineType: MATERIAL_REQUISITION_LINE_TYPES.MATERIAL,
      })),
      ...input.paintItems.map((it) => ({
        ...it,
        lineType: MATERIAL_REQUISITION_LINE_TYPES.PAINT,
      })),
    ];

    const partIds = [...new Set(allInputItems.map((i) => i.inventoryPartId))];
    const parts = await tx.inventoryPart.findMany({
      where: { id: { in: partIds }, isActive: true, CompanyId: companyId },
    });

    if (parts.length !== partIds.length) {
      throw new Error("Una o más piezas no existen o están inactivas en inventario");
    }

    const partMap = new Map(parts.map((p) => [p.id, p]));

    for (const item of allInputItems) {
      const part = partMap.get(item.inventoryPartId)!;
      const avail = availableQuantity(
        part.quantityOnHand,
        part.reservedQuantity,
      );
      if (Number(item.quantity) > avail) {
        throw new Error(
          `${part.name}: stock insuficiente (disponible ${avail} ${part.unit})`,
        );
      }
    }

    const materialLines = buildRequisitionLines(
      input.materialItems,
      MATERIAL_REQUISITION_LINE_TYPES.MATERIAL,
      partMap,
    );
    const paintLines = buildRequisitionLines(
      input.paintItems,
      MATERIAL_REQUISITION_LINE_TYPES.PAINT,
      partMap,
    );
    const lineItems = [...materialLines, ...paintLines];
    const total = lineItems.reduce((acc, it) => acc + it.total, 0);

    const req = await tx.materialRequisition.create({
      data: {
        workOrderId: input.workOrderId,
        total,
        Status: "PENDING",
        items: {
          create: lineItems.map(
            ({ inventoryPartId, lineType, unit, ...row }) => ({
              ...row,
              InventoryPartId: inventoryPartId,
              LineType: lineType,
              Unit: unit,
            }),
          ),
        },
      },
      include: { items: true },
    });

    const reqLabel = `RM-${String(req.id).padStart(5, "0")}`;

    for (const item of allInputItems) {
      const part = partMap.get(item.inventoryPartId)!;
      await applyInventoryMovement(tx, {
        inventoryPartId: item.inventoryPartId,
        movementType: INVENTORY_MOVEMENT_TYPES.OUT,
        quantity: Number(item.quantity),
        reason: "WORK_ORDER",
        workOrderId: input.workOrderId,
        notes: `Requisición ${reqLabel} · ${part.PartType === INVENTORY_PART_TYPES.PAINT ? "Pintura" : "Material"}`,
        createdBy: item.assignedEmployee || null,
      });
    }

    return req;
    },
    { maxWait: 30000, timeout: 30000 },
  );
}
