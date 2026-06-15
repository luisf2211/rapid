import { MATERIAL_REQUISITION_LINE_TYPES } from "@/lib/constants";
import { parseFractionQuantity } from "@/lib/formatters/fraction-quantity";

export type RequisitionLineType =
  (typeof MATERIAL_REQUISITION_LINE_TYPES)[keyof typeof MATERIAL_REQUISITION_LINE_TYPES];

/**
 * Materiales: cantidad × precio.
 * Pintura: al utilizar (aunque sea fracción) se carga el precio completo
 * de la unidad; si la cantidad es ≥ 1, se multiplica por galones/unidades.
 */
export function requisitionLineTotal(
  lineType: RequisitionLineType,
  quantity: unknown,
  unitPrice: unknown,
): number {
  const qty = parseFractionQuantity(quantity) ?? 0;
  const price = Number(unitPrice) || 0;
  if (qty <= 0 || price <= 0) return 0;

  if (lineType === MATERIAL_REQUISITION_LINE_TYPES.PAINT) {
    if (qty < 1) return price;
    return qty * price;
  }

  return qty * price;
}

export function isPaintRequisitionLineType(
  lineType: RequisitionLineType,
): boolean {
  return lineType === MATERIAL_REQUISITION_LINE_TYPES.PAINT;
}
