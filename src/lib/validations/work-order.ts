import { z } from "zod";

export const checklistSchema = z.object({
  ac: z.boolean().default(false),
  carpets: z.boolean().default(false),
  seats: z.boolean().default(false),
  speakers: z.boolean().default(false),
  seatBelts: z.boolean().default(false),
  radio: z.boolean().default(false),
  documents: z.boolean().default(false),
  rearViewMirror: z.boolean().default(false),
  alarm: z.boolean().default(false),
  checkEngine: z.boolean().default(false),
  abs: z.boolean().default(false),
  airbag: z.boolean().default(false),
  brake: z.boolean().default(false),
  tireLight: z.boolean().default(false),
  stabilityLight: z.boolean().default(false),
  jack: z.boolean().default(false),
  spareTire: z.boolean().default(false),
  logos: z.boolean().default(false),
  wheelKeys: z.boolean().default(false),
  keychains: z.boolean().default(false),
  lenses: z.boolean().default(false),
  speakerCovers: z.boolean().default(false),
  gasCap: z.boolean().default(false),
  antennas: z.boolean().default(false),
  batteries: z.boolean().default(false),
  windows: z.boolean().default(false),
});

export type ChecklistInput = z.infer<typeof checklistSchema>;

export const damageSchema = z.object({
  vehicleSide: z.enum(["FRONT", "BACK", "LEFT", "RIGHT", "TOP"]),
  damageType: z.enum(["SCRATCH", "DENT", "PAINT_DAMAGE", "BROKEN", "OTHER"]),
  description: z.string().max(250).optional().or(z.literal("")),
  positionX: z.coerce.number().optional(),
  positionY: z.coerce.number().optional(),
});

export type DamageInput = z.infer<typeof damageSchema>;

export const photoSchema = z.object({
  photoUrl: z.string().min(1, "URL requerida").max(500),
  photoType: z
    .enum(["GENERAL", "DAMAGE", "BEFORE", "AFTER", "DOCUMENT"])
    .default("GENERAL"),
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
  engine: z.string().max(50).optional().or(z.literal("")),

  // Recepción
  deliveryDate: z.string().min(1, "Fecha requerida"),
  deliveryTime: z.string().min(1, "Hora requerida"),
  fuelLevel: z
    .enum(["EMPTY", "QUARTER", "HALF", "THREE_QUARTERS", "FULL"])
    .default("HALF"),
  requestedDamages: z.string().max(4000).optional().or(z.literal("")),
  observations: z.string().max(4000).optional().or(z.literal("")),
  receivedBy: z.string().min(1, "Recibido por es requerido").max(150),
  notes: z.string().max(4000).optional().or(z.literal("")),

  // Detalles
  checklist: checklistSchema,
  damages: z.array(damageSchema).default([]),
  photos: z.array(photoSchema).default([]),
});

export type WorkOrderInput = z.output<typeof workOrderSchema>;
export type WorkOrderFormValues = z.input<typeof workOrderSchema>;
