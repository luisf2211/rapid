import { formatDateTime } from "@/lib/formatters/date";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { splitRequisitionItems } from "@/lib/material-requisition/line-type";
import { toPlainNumber } from "@/lib/serialize";

type MaterialRequisitionWithItems = {
  id: number;
  createdAt: Date | null;
  total: unknown;
  items: {
    productName: string;
    quantity: unknown;
    unitPrice: unknown;
    total: unknown;
    assignedEmployee: string | null;
    LineType?: string;
  }[];
  workOrder: {
    orderNumber: number;
    customerName: string | null;
    brand: string | null;
    model: string | null;
    plate: string | null;
  };
};

export type MaterialRequisitionPrintLine = {
  productName: string;
  quantity: string;
  unitPrice: number;
  total: number;
  assignedEmployee: string | null;
};

export type MaterialRequisitionPrintData = {
  docTitle: string;
  docNumber: string;
  createdAt: string;
  customerName: string;
  vehicleLabel: string;
  plate: string | null;
  workOrderNumber: string;
  total: number;
  materialSubtotal: number;
  paintSubtotal: number;
  materialLines: MaterialRequisitionPrintLine[];
  paintLines: MaterialRequisitionPrintLine[];
  /** @deprecated use materialLines + paintLines */
  lines: MaterialRequisitionPrintLine[];
};

function mapPrintLine(
  it: MaterialRequisitionWithItems["items"][number],
): MaterialRequisitionPrintLine {
  return {
    productName: it.productName,
    quantity: formatFractionQuantity(toPlainNumber(it.quantity) ?? 1),
    unitPrice: toPlainNumber(it.unitPrice) ?? 0,
    total: toPlainNumber(it.total) ?? 0,
    assignedEmployee: it.assignedEmployee,
  };
}

export function buildMaterialRequisitionPrintData(
  req: MaterialRequisitionWithItems,
): MaterialRequisitionPrintData {
  const wo = req.workOrder;
  const { materialItems, paintItems } = splitRequisitionItems(req.items);
  const materialLines = materialItems.map(mapPrintLine);
  const paintLines = paintItems.map(mapPrintLine);
  const materialSubtotal = materialLines.reduce((acc, l) => acc + l.total, 0);
  const paintSubtotal = paintLines.reduce((acc, l) => acc + l.total, 0);

  return {
    docTitle: "REQUISICIÓN DE MATERIALES",
    docNumber: `RM-${String(req.id).padStart(5, "0")}`,
    createdAt: req.createdAt ? formatDateTime(req.createdAt) : "—",
    customerName: wo.customerName ?? "—",
    vehicleLabel: [wo.brand, wo.model].filter(Boolean).join(" ") || "—",
    plate: wo.plate,
    workOrderNumber: `ORD-${String(wo.orderNumber).padStart(5, "0")}`,
    total: toPlainNumber(req.total) ?? materialSubtotal + paintSubtotal,
    materialSubtotal,
    paintSubtotal,
    materialLines,
    paintLines,
    lines: [...materialLines, ...paintLines],
  };
}
