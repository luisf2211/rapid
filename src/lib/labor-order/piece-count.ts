import { toPlainNumber } from "@/lib/serialize";

/** Cantidad de piezas en una línea. */
export function laborItemQuantity(item: {
  quantity?: unknown;
  total?: unknown;
}): number {
  const qty = toPlainNumber(item.quantity);
  if (qty != null) return qty;
  return toPlainNumber(item.total) ?? 0;
}

/** Precio por pieza en una línea. */
export function laborItemUnitPrice(item: { unitPrice?: unknown }): number {
  return toPlainNumber(item.unitPrice) ?? 0;
}

/** Total en $ de una línea (cantidad × precio). */
export function laborItemLineAmount(item: {
  quantity?: unknown;
  unitPrice?: unknown;
  total?: unknown;
}): number {
  const qty = laborItemQuantity(item);
  const unitPrice = laborItemUnitPrice(item);
  if (unitPrice > 0 && qty > 0) {
    return roundMoney(qty * unitPrice);
  }
  const stored = toPlainNumber(item.total) ?? 0;
  const qtyStored = toPlainNumber(item.quantity);
  // Legacy: Total guardaba cantidad de piezas (igual a Quantity)
  if (qtyStored != null && stored === qtyStored) return 0;
  return stored;
}

export function computeLaborLineAmount(
  quantity: number,
  unitPrice: number,
): number {
  return roundMoney(quantity * unitPrice);
}

/** Suma de piezas trabajadas. */
export function sumLaborOrderPieces(
  items: { quantity?: unknown; total?: unknown }[],
): number {
  return items.reduce((acc, it) => acc + laborItemQuantity(it), 0);
}

/** Suma de montos $ en líneas de mano de obra. */
export function sumLaborOrderAmount(
  items: {
    quantity?: unknown;
    unitPrice?: unknown;
    total?: unknown;
  }[],
): number {
  return roundMoney(
    items.reduce((acc, it) => acc + laborItemLineAmount(it), 0),
  );
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatPieceCount(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, "");
}

/** @deprecated use laborItemQuantity */
export function laborItemPieceTotal(item: {
  quantity?: unknown;
  total?: unknown;
}): number {
  return laborItemQuantity(item);
}
