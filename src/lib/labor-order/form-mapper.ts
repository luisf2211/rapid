import type { LaborOrderItem } from "@prisma/client";
import {
  laborItemLineAmount,
  laborItemQuantity,
  laborItemUnitPrice,
} from "./piece-count";
import type { LaborOrderFormValues } from "@/lib/validations/labor-order";
import { laborOrderWorkerName } from "./worker-name";
import type { LaborOrderWithRelations } from "@/services/labor-orders.service";

export type { LaborOrderWithRelations };

export function laborOrderToFormValues(
  lo: LaborOrderWithRelations,
): LaborOrderFormValues {
  return {
    workOrderId: lo.workOrderId,
    employeeId: lo.EmployeeId ?? 0,
    items:
      lo.items.length > 0
        ? lo.items.map((it) => ({
            partName: it.partName,
            quantity: laborItemQuantity(it) || 1,
            unitPrice: laborItemUnitPrice(it) || laborItemLineAmount(it) / (laborItemQuantity(it) || 1) || 0,
          }))
        : [{ partName: "", quantity: 1, unitPrice: 0 }],
  };
}

export function laborOrderDisplayWorker(lo: LaborOrderWithRelations): string {
  if (lo.Employee) {
    return `${lo.Employee.Role} — ${lo.Employee.Name}`;
  }
  return laborOrderWorkerName(lo);
}

export function laborOrderHeaderAmount(lo: {
  total?: unknown;
  items: LaborOrderItem[];
}): number {
  const fromItems = lo.items.reduce(
    (acc, it) => acc + laborItemLineAmount(it),
    0,
  );
  if (fromItems > 0) return fromItems;
  return Number(lo.total ?? 0);
}
