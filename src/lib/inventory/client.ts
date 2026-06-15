import { toPlainNumber } from "@/lib/serialize";

/** Pieza serializada para formularios cliente (sin Decimal de Prisma). */
export type InventoryPartClient = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  partType: string;
  unit: string;
  quantityOnHand: number;
  reservedQuantity: number;
  minQuantity: number | null;
  unitCost: number | null;
  location: string | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
};

type PartSource = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  PartType?: string | null;
  unit: string;
  quantityOnHand: unknown;
  reservedQuantity: unknown;
  minQuantity: unknown;
  unitCost: unknown;
  location: string | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
};

/** Opción para selectores en requisición (solo datos planos). */
export type InventoryPartOption = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  unitCost: number | null;
  available: number;
  category: string | null;
  partType: string;
};

export function serializeInventoryPartOption(
  part: PartSource,
): InventoryPartOption {
  const onHand = toPlainNumber(part.quantityOnHand) ?? 0;
  const reserved = toPlainNumber(part.reservedQuantity) ?? 0;
  return {
    id: part.id,
    sku: part.sku,
    name: part.name,
    unit: part.unit,
    unitCost: toPlainNumber(part.unitCost),
    available: onHand - reserved,
    category: part.category,
    partType: part.PartType ?? "MATERIAL",
  };
}

export function serializeInventoryPartForClient(
  part: PartSource,
): InventoryPartClient {
  return {
    id: part.id,
    sku: part.sku,
    name: part.name,
    description: part.description,
    category: part.category,
    partType: part.PartType ?? "MATERIAL",
    unit: part.unit,
    quantityOnHand: toPlainNumber(part.quantityOnHand) ?? 0,
    reservedQuantity: toPlainNumber(part.reservedQuantity) ?? 0,
    minQuantity: toPlainNumber(part.minQuantity),
    unitCost: toPlainNumber(part.unitCost),
    location: part.location,
    isActive: part.isActive,
    createdBy: part.createdBy,
    updatedBy: part.updatedBy,
  };
}
