import { z } from "zod";
import {
  CHECKLIST_ITEMS,
  LEGACY_CHECKLIST_ITEMS,
  type ActiveChecklistField,
  type LegacyChecklistField,
} from "@/lib/constants";

export const checklistItemSchema = z.object({
  checked: z.boolean().default(false),
  comment: z.string().max(4000).optional().or(z.literal("")),
});

export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;

/**
 * Los ítems vigentes siempre viajan; los retirados solo cuando la orden ya los
 * tenía guardados, así una recepción nueva nunca los vuelve a crear.
 */
const checklistShape = {
  ...Object.fromEntries(
    CHECKLIST_ITEMS.map((item) => [item.field, checklistItemSchema]),
  ),
  ...Object.fromEntries(
    LEGACY_CHECKLIST_ITEMS.map((item) => [
      item.field,
      checklistItemSchema.optional(),
    ]),
  ),
} as Record<ActiveChecklistField, typeof checklistItemSchema> &
  Record<LegacyChecklistField, z.ZodOptional<typeof checklistItemSchema>>;

export const checklistSchema = z.object(checklistShape);

export type ChecklistInput = z.infer<typeof checklistSchema>;

export const damageSchema = z.object({
  vehicleSide: z.enum(["FRONT", "BACK", "LEFT", "RIGHT", "TOP"]),
  damageType: z.enum(["SCRATCH", "DENT", "PAINT_DAMAGE", "BROKEN", "OTHER"]),
  description: z.string().max(250).optional().or(z.literal("")),
  /** Zona numerada del vehículo señalada en el diagrama. */
  zoneNumber: z.number().int().positive().optional(),
  // Legacy: coordenadas libres de daños antiguos (solo lectura, ya no se editan).
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export type DamageInput = z.infer<typeof damageSchema>;

export const photoSchema = z.object({
  photoUrl: z.string().min(1, "Imagen requerida").max(500),
  photoType: z
    .enum([
      "GENERAL",
      "RECEPTION",
      "FRONT",
      "BACK",
      "LEFT",
      "RIGHT",
      "DAMAGE",
      "BEFORE",
      "AFTER",
      "DOCUMENT",
    ])
    .default("RECEPTION"),
  description: z.string().max(250).optional().or(z.literal("")),
});

export type PhotoInput = z.infer<typeof photoSchema>;

export const workOrderSchema = z.object({
  // Cliente
  customerName: z.string().min(2, "Nombre del cliente requerido").max(150),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z
    .string()
    .max(150)
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  address: z.string().max(250).optional().or(z.literal("")),

  // Vehículo
  brand: z.string().min(1, "Marca requerida").max(80),
  model: z.string().min(1, "Modelo requerido").max(80),
  vehicleYear: z.coerce
    .number()
    .int()
    .min(1900, "Año inválido")
    .max(new Date().getFullYear() + 2),
  color: z.string().min(1, "Color requerido").max(50),
  plate: z.string().min(1, "Placa requerida").max(30),
  mileage: z.string().max(50).optional().or(z.literal("")),
  mileageUnit: z.enum(["mi", "km"]).default("mi"),
  engine: z.string().max(50).optional().or(z.literal("")),

  // Recepción
  deliveryDate: z.string().min(1, "Fecha requerida"),
  deliveryTime: z.string().min(1, "Hora requerida"),
  exitDate: z.string().optional().or(z.literal("")),
  exitTime: z.string().optional().or(z.literal("")),
  fuelLevel: z
    .enum(["EMPTY", "QUARTER", "HALF", "THREE_QUARTERS", "FULL"])
    .default("HALF"),
  requestedDamages: z.string().max(4000).optional().or(z.literal("")),
  observations: z.string().max(4000).optional().or(z.literal("")),
  receivedBy: z.string().min(1, "Recibido por es requerido").max(150),
  customerReceivedSignature: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),

  // Detalles
  checklist: checklistSchema,
  damages: z.array(damageSchema).default([]),
  photos: z.array(photoSchema).default([]),
});

export type WorkOrderInput = z.output<typeof workOrderSchema>;
export type WorkOrderFormValues = z.input<typeof workOrderSchema>;

/** Requiere firma del cliente al crear recepción. */
export const workOrderCreateSchema = workOrderSchema.refine(
  (data) => Boolean(data.customerReceivedSignature?.trim()),
  {
    message: "Confirme la firma del cliente antes de guardar",
    path: ["customerReceivedSignature"],
  },
);
