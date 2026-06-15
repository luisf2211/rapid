import {
  laborItemLineAmount,
  laborItemQuantity,
  laborItemUnitPrice,
} from "@/lib/labor-order/piece-count";

export type EmployeeLaborWorkLine = {
  laborOrderItemId: number;
  laborOrderId: number;
  workOrderId: number;
  workOrderNumber: number;
  laborOrderNumber: number | null;
  plate: string | null;
  customerName: string | null;
  partName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  workedAt: string;
  alreadyInAdvance: boolean;
};

export function buildAdvanceWorkDescription(input: {
  workOrderNumber: number;
  laborOrderId: number;
  laborOrderNumber: number | null;
  partName: string;
  plate: string | null;
}): string {
  const mo = input.laborOrderNumber ?? input.laborOrderId;
  const plate = input.plate?.trim();
  const base = `OR-${String(input.workOrderNumber).padStart(5, "0")} · MO-${String(mo).padStart(5, "0")} · ${input.partName.trim()}`;
  return plate ? `${base} · ${plate}` : base;
}

export function mapLaborOrderToWorkLines(
  laborOrder: {
    id: number;
    OrderNumber: number | null;
    createdAt: Date | null;
    items: {
      id: number;
      partName: string;
      quantity?: unknown;
      unitPrice?: unknown;
      total?: unknown;
    }[];
    workOrder: {
      id: number;
      orderNumber: number;
      plate: string | null;
      customerName: string | null;
    };
  },
  usedItemIds: Set<number>,
): EmployeeLaborWorkLine[] {
  return laborOrder.items.map((item) => ({
    laborOrderItemId: item.id,
    laborOrderId: laborOrder.id,
    workOrderId: laborOrder.workOrder.id,
    workOrderNumber: laborOrder.workOrder.orderNumber,
    laborOrderNumber: laborOrder.OrderNumber,
    plate: laborOrder.workOrder.plate,
    customerName: laborOrder.workOrder.customerName,
    partName: item.partName,
    quantity: laborItemQuantity(item),
    unitPrice: laborItemUnitPrice(item),
    amount: laborItemLineAmount(item),
    workedAt: laborOrder.createdAt?.toISOString() ?? new Date().toISOString(),
    alreadyInAdvance: usedItemIds.has(item.id),
  }));
}

export function snapshotAdvanceWorkLine(
  line: EmployeeLaborWorkLine,
): {
  LaborOrderId: number;
  LaborOrderItemId: number;
  WorkOrderId: number;
  WorkOrderNumber: number;
  Plate: string | null;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  Amount: number;
} {
  return {
    LaborOrderId: line.laborOrderId,
    LaborOrderItemId: line.laborOrderItemId,
    WorkOrderId: line.workOrderId,
    WorkOrderNumber: line.workOrderNumber,
    Plate: line.plate,
    Description: buildAdvanceWorkDescription({
      workOrderNumber: line.workOrderNumber,
      laborOrderId: line.laborOrderId,
      laborOrderNumber: line.laborOrderNumber,
      partName: line.partName,
      plate: line.plate,
    }),
    Quantity: line.quantity,
    UnitPrice: line.unitPrice,
    Amount: line.amount,
  };
}

export function sumSelectedWorkAmount(
  lines: EmployeeLaborWorkLine[],
  selectedIds: number[],
): number {
  const selected = new Set(selectedIds);
  const total = lines
    .filter((l) => selected.has(l.laborOrderItemId))
    .reduce((acc, l) => acc + l.amount, 0);
  return Math.round(total * 100) / 100;
}
