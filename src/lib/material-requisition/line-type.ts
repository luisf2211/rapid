import { MATERIAL_REQUISITION_LINE_TYPES } from "@/lib/constants";

type RequisitionItemLike = {
  LineType?: string;
  lineType?: string;
};

export function requisitionItemLineType(item: RequisitionItemLike): string {
  return item.LineType ?? item.lineType ?? MATERIAL_REQUISITION_LINE_TYPES.MATERIAL;
}

export function isPaintRequisitionItem(item: RequisitionItemLike): boolean {
  return requisitionItemLineType(item) === MATERIAL_REQUISITION_LINE_TYPES.PAINT;
}

export function splitRequisitionItems<T extends RequisitionItemLike>(items: T[]) {
  const materialItems: T[] = [];
  const paintItems: T[] = [];
  for (const item of items) {
    if (isPaintRequisitionItem(item)) {
      paintItems.push(item);
    } else {
      materialItems.push(item);
    }
  }
  return { materialItems, paintItems };
}
