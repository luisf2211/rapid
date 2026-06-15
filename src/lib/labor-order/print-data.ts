import { formatDateTime } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import {
  formatPieceCount,
  laborItemLineAmount,
  laborItemQuantity,
  laborItemUnitPrice,
  sumLaborOrderAmount,
  sumLaborOrderPieces,
} from "@/lib/labor-order/piece-count";

type LaborOrderWithItems = {
  id: number;
  createdAt: Date | null;
  technician: string | null;
  total: unknown;
  items: {
    partName: string;
    quantity: unknown;
    unitPrice: unknown;
    total: unknown;
  }[];
  workOrder: {
    orderNumber: number;
    customerName: string | null;
    brand: string | null;
    model: string | null;
    plate: string | null;
  };
};

export type LaborOrderPrintData = {
  docTitle: string;
  docNumber: string;
  createdAt: string;
  workerName: string;
  customerName: string;
  vehicleLabel: string;
  plate: string | null;
  workOrderNumber: string;
  totalPieces: number;
  totalAmount: number;
  lines: {
    partName: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
  }[];
};

export function buildLaborOrderPrintData(
  lo: LaborOrderWithItems,
  workerName: string,
): LaborOrderPrintData {
  const wo = lo.workOrder;
  const totalPieces = sumLaborOrderPieces(lo.items);
  const totalAmount = sumLaborOrderAmount(lo.items);
  return {
    docTitle: "MANO DE OBRA — PRODUCCIÓN",
    docNumber: `MO-${String(lo.id).padStart(5, "0")}`,
    createdAt: lo.createdAt ? formatDateTime(lo.createdAt) : "—",
    workerName,
    customerName: wo.customerName ?? "—",
    vehicleLabel: [wo.brand, wo.model].filter(Boolean).join(" ") || "—",
    plate: wo.plate,
    workOrderNumber: `ORD-${String(wo.orderNumber).padStart(5, "0")}`,
    totalPieces,
    totalAmount,
    lines: lo.items.map((it) => ({
      partName: it.partName,
      quantity: formatPieceCount(laborItemQuantity(it)),
      unitPrice: formatMoney(laborItemUnitPrice(it)),
      lineTotal: formatMoney(laborItemLineAmount(it)),
    })),
  };
}
