import { prisma } from "@/lib/prisma";
import { INVENTORY_MOVEMENT_TYPES } from "@/lib/constants";
import { formatRequisitionProductName } from "@/lib/material-requisition";
import {
  applyInventoryMovement,
  availableQuantity,
} from "@/services/inventory.service";
import type { MaterialRequisitionInput } from "@/lib/validations/material-requisition";

export async function listMaterialRequisitions(params?: {
  workOrderId?: number;
}) {
  return prisma.materialRequisition.findMany({
    where: params?.workOrderId ? { workOrderId: params.workOrderId } : undefined,
    include: {
      workOrder: true,
      items: true,
    },
    orderBy: { id: "desc" },
  });
}

export async function getMaterialRequisitionById(id: number) {
  return prisma.materialRequisition.findUnique({
    where: { id },
    include: {
      workOrder: true,
      items: true,
    },
  });
}

export async function createMaterialRequisition(
  input: MaterialRequisitionInput,
) {
  return prisma.$transaction(async (tx) => {
    const partIds = [...new Set(input.items.map((i) => i.inventoryPartId))];
    const parts = await tx.inventoryPart.findMany({
      where: { id: { in: partIds }, isActive: true },
    });

    if (parts.length !== partIds.length) {
      throw new Error("Una o más piezas no existen o están inactivas en inventario");
    }

    const partMap = new Map(parts.map((p) => [p.id, p]));

    for (const item of input.items) {
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

    const lineItems = input.items.map((it) => {
      const part = partMap.get(it.inventoryPartId)!;
      const qty = Number(it.quantity);
      const price = Number(it.unitPrice);
      return {
        productName: formatRequisitionProductName(part.sku, part.name),
        quantity: qty,
        unitPrice: price,
        total: qty * price,
        assignedEmployee: it.assignedEmployee || null,
        inventoryPartId: it.inventoryPartId,
      };
    });

    const total = lineItems.reduce((acc, it) => acc + it.total, 0);

    const req = await tx.materialRequisition.create({
      data: {
        workOrderId: input.workOrderId,
        total,
        items: {
          create: lineItems.map(({ inventoryPartId: _id, ...row }) => row),
        },
      },
      include: { items: true },
    });

    const reqLabel = `RM-${String(req.id).padStart(5, "0")}`;

    for (const item of input.items) {
      await applyInventoryMovement(tx, {
        inventoryPartId: item.inventoryPartId,
        movementType: INVENTORY_MOVEMENT_TYPES.OUT,
        quantity: Number(item.quantity),
        reason: "WORK_ORDER",
        workOrderId: input.workOrderId,
        notes: `Requisición ${reqLabel}`,
        createdBy: item.assignedEmployee || null,
      });
    }

    return req;
  });
}
