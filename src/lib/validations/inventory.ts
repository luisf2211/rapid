import { z } from "zod";
import { INVENTORY_MOVEMENT_TYPES } from "@/lib/constants";

const optionalNumber = z
  .union([z.coerce.number().min(0), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v == null ? undefined : v));

const optionalString = z
  .string()
  .max(150)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

export const inventoryPartSchema = z.object({
  sku: z.string().trim().min(1, "SKU requerido").max(50),
  name: z.string().min(1, "Nombre requerido").max(150),
  description: z.string().max(250).optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
  unit: z.string().max(20).default("PZ"),
  quantityOnHand: z.coerce.number().min(0).default(0),
  minQuantity: optionalNumber,
  unitCost: optionalNumber,
  location: z.string().max(80).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  createdBy: optionalString,
  updatedBy: optionalString,
});

export type InventoryPartInput = z.output<typeof inventoryPartSchema>;
export type InventoryPartFormValues = z.input<typeof inventoryPartSchema>;

export const inventoryMovementSchema = z.object({
  inventoryPartId: z.coerce.number().int().positive(),
  movementType: z.enum([
    INVENTORY_MOVEMENT_TYPES.IN,
    INVENTORY_MOVEMENT_TYPES.OUT,
    INVENTORY_MOVEMENT_TYPES.ADJUST,
  ]),
  quantity: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  unitCostAtMovement: optionalNumber,
  reason: z.string().max(50).optional().or(z.literal("")),
  workOrderId: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v)),
  notes: z.string().max(250).optional().or(z.literal("")),
  createdBy: optionalString,
});

export type InventoryMovementInput = z.output<typeof inventoryMovementSchema>;
export type InventoryMovementFormValues = z.input<typeof inventoryMovementSchema>;
