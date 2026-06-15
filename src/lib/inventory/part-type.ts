import {
  INVENTORY_PART_TYPES,
  type InventoryPartType,
} from "@/lib/constants";

export function isPaintPartType(partType: string | null | undefined): boolean {
  return partType === INVENTORY_PART_TYPES.PAINT;
}

export function partTypeLabel(partType: string | null | undefined): string {
  return isPaintPartType(partType) ? "Pintura" : "Material";
}

export function inferPartTypeFromCategory(
  category: string | null | undefined,
): InventoryPartType {
  const cat = category?.trim().toLowerCase();
  if (cat === "pintura") return INVENTORY_PART_TYPES.PAINT;
  return INVENTORY_PART_TYPES.MATERIAL;
}

export function defaultUnitForPartType(
  partType: InventoryPartType,
): string {
  return partType === INVENTORY_PART_TYPES.PAINT ? "GL" : "PZ";
}
