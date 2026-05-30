import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { INVENTORY_MOVEMENT_TYPES } from "@/lib/constants";
import { toPlainNumber } from "@/lib/serialize";
import type { InventoryStockAlert } from "@/lib/inventory/alerts";
import type {
  InventoryMovementInput,
  InventoryPartInput,
} from "@/lib/validations/inventory";

const STOCK_ALERTS_PREVIEW = 6;

type TransactionClient = Prisma.TransactionClient;

export function availableQuantity(
  onHand: unknown,
  reserved: unknown,
) {
  return (toPlainNumber(onHand) ?? 0) - (toPlainNumber(reserved) ?? 0);
}

export async function listActiveInventoryPartsForPicker() {
  return prisma.inventoryPart.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function listInventoryParts(params?: {
  search?: string;
  filter?: "all" | "low" | "inactive";
}) {
  const search = params?.search?.trim();
  const filter = params?.filter ?? "all";

  const parts = await prisma.inventoryPart.findMany({
    where: {
      ...(filter === "inactive" ? { isActive: false } : {}),
      ...(filter === "all" || filter === "inactive"
        ? {}
        : { isActive: true }),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { sku: { contains: search } },
              { category: { contains: search } },
              { location: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  if (filter !== "low") return parts;

  return parts.filter((p) => isPartLowOrOutOfStock(p));
}

function isPartLowOrOutOfStock(part: {
  isActive: boolean;
  quantityOnHand: unknown;
  reservedQuantity: unknown;
  minQuantity: unknown;
}): boolean {
  if (!part.isActive) return false;
  const available = availableQuantity(
    part.quantityOnHand,
    part.reservedQuantity,
  );
  if (available <= 0) return true;
  if (part.minQuantity == null) return false;
  return available <= Number(part.minQuantity);
}

export async function getInventoryStockAlerts(): Promise<{
  alerts: InventoryStockAlert[];
  total: number;
}> {
  const parts = await prisma.inventoryPart.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      sku: true,
      name: true,
      unit: true,
      quantityOnHand: true,
      reservedQuantity: true,
      minQuantity: true,
    },
  });

  const all: InventoryStockAlert[] = [];

  for (const p of parts) {
    const available = availableQuantity(
      p.quantityOnHand,
      p.reservedQuantity,
    );
    const min = toPlainNumber(p.minQuantity);

    if (available <= 0) {
      all.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        available,
        minQuantity: min,
        level: "out",
      });
    } else if (min != null && available <= min) {
      all.push({
        id: p.id,
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        available,
        minQuantity: min,
        level: "low",
      });
    }
  }

  all.sort((a, b) => {
    if (a.level !== b.level) return a.level === "out" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return {
    alerts: all.slice(0, STOCK_ALERTS_PREVIEW),
    total: all.length,
  };
}

export async function getInventoryPartById(id: number) {
  return prisma.inventoryPart.findUnique({
    where: { id },
    include: {
      movements: {
        include: { workOrder: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { movements: true } },
    },
  });
}

export async function createInventoryPart(input: InventoryPartInput) {
  return prisma.inventoryPart.create({
    data: {
      sku: input.sku.trim(),
      name: input.name,
      description: input.description || null,
      category: input.category || null,
      unit: input.unit || "PZ",
      quantityOnHand: input.quantityOnHand,
      reservedQuantity: 0,
      minQuantity: input.minQuantity ?? null,
      unitCost: input.unitCost ?? null,
      location: input.location || null,
      isActive: input.isActive,
      createdBy: input.createdBy || null,
    },
  });
}

export async function updateInventoryPart(
  id: number,
  input: InventoryPartInput,
) {
  return prisma.inventoryPart.update({
    where: { id },
    data: {
      sku: input.sku.trim(),
      name: input.name,
      description: input.description || null,
      category: input.category || null,
      unit: input.unit || "PZ",
      minQuantity: input.minQuantity ?? null,
      unitCost: input.unitCost ?? null,
      location: input.location || null,
      isActive: input.isActive,
      updatedAt: new Date(),
      updatedBy: input.updatedBy || null,
    },
  });
}

function computeStock(
  current: number,
  type: string,
  quantity: number,
): number {
  if (type === INVENTORY_MOVEMENT_TYPES.IN) return current + quantity;
  if (type === INVENTORY_MOVEMENT_TYPES.OUT) return current - quantity;
  return quantity;
}

export async function applyInventoryMovement(
  tx: TransactionClient,
  input: {
    inventoryPartId: number;
    movementType: string;
    quantity: number;
    unitCostAtMovement?: number | null;
    reason?: string | null;
    workOrderId?: number | null;
    notes?: string | null;
    createdBy?: string | null;
  },
) {
  const part = await tx.inventoryPart.findUnique({
    where: { id: input.inventoryPartId },
  });
  if (!part) throw new Error("Pieza no encontrada");

  const before = Number(part.quantityOnHand);
  const reserved = Number(part.reservedQuantity);
  const available = before - reserved;
  const qty = Number(input.quantity);
  const after = computeStock(before, input.movementType, qty);

  if (input.movementType === INVENTORY_MOVEMENT_TYPES.OUT) {
    if (qty > available) {
      throw new Error(
        `${part.name}: stock disponible insuficiente (${available} ${part.unit})`,
      );
    }
  }
  if (after < reserved) {
    throw new Error(
      "El stock no puede quedar por debajo de la cantidad reservada",
    );
  }
  if (after < 0) {
    throw new Error("El stock resultante no puede ser negativo");
  }

  const movement = await tx.inventoryMovement.create({
    data: {
      inventoryPartId: input.inventoryPartId,
      movementType: input.movementType,
      quantity: qty,
      quantityBefore: before,
      quantityAfter: after,
      unitCostAtMovement: input.unitCostAtMovement ?? null,
      reason: input.reason || null,
      workOrderId: input.workOrderId || null,
      notes: input.notes || null,
      createdBy: input.createdBy || null,
    },
  });

  await tx.inventoryPart.update({
    where: { id: input.inventoryPartId },
    data: {
      quantityOnHand: after,
      ...(input.movementType === INVENTORY_MOVEMENT_TYPES.IN &&
      input.unitCostAtMovement != null
        ? { unitCost: input.unitCostAtMovement }
        : {}),
      updatedAt: new Date(),
      updatedBy: input.createdBy || null,
    },
  });

  return movement;
}

export async function createInventoryMovement(input: InventoryMovementInput) {
  return prisma.$transaction((tx) =>
    applyInventoryMovement(tx, {
      inventoryPartId: input.inventoryPartId,
      movementType: input.movementType,
      quantity: input.quantity,
      unitCostAtMovement: input.unitCostAtMovement,
      reason: input.reason,
      workOrderId: input.workOrderId,
      notes: input.notes,
      createdBy: input.createdBy,
    }),
  );
}

export type DeleteInventoryPartResult =
  | { mode: "deleted" }
  | { mode: "deactivated" };

export async function deleteInventoryPart(
  id: number,
): Promise<DeleteInventoryPartResult> {
  const part = await prisma.inventoryPart.findUnique({
    where: { id },
    include: { _count: { select: { movements: true } } },
  });
  if (!part) throw new Error("Pieza no encontrada");

  const onHand = toPlainNumber(part.quantityOnHand) ?? 0;
  const reserved = toPlainNumber(part.reservedQuantity) ?? 0;
  const hasMovements = part._count.movements > 0;

  if (hasMovements) {
    await prisma.inventoryPart.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });
    return { mode: "deactivated" };
  }

  if (onHand > 0 || reserved > 0) {
    throw new Error(
      "Deja el stock y las reservas en cero antes de eliminar la pieza.",
    );
  }

  await prisma.inventoryPart.delete({ where: { id } });
  return { mode: "deleted" };
}

export async function getInventoryStats() {
  const [totalParts, activeParts, activePartsRows] = await Promise.all([
    prisma.inventoryPart.count(),
    prisma.inventoryPart.count({ where: { isActive: true } }),
    prisma.inventoryPart.findMany({
      where: { isActive: true },
      select: {
        quantityOnHand: true,
        reservedQuantity: true,
        minQuantity: true,
        isActive: true,
      },
    }),
  ]);

  const lowStockCount = activePartsRows.filter(isPartLowOrOutOfStock).length;

  return { totalParts, activeParts, lowStockCount };
}
