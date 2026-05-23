import { z } from "zod";

export const laborItemSchema = z.object({
  partName: z.string().min(1, "Pieza requerida").max(150),
  desabCost: z.coerce.number().min(0).default(0),         // Desabolladura
  disassemblerCost: z.coerce.number().min(0).default(0),  // Desarme
  prepCost: z.coerce.number().min(0).default(0),          // Preparación
  painterCost: z.coerce.number().min(0).default(0),       // Pintura
  polisherCost: z.coerce.number().min(0).default(0),      // Pulido
  total: z.coerce.number().min(0).default(0),
});

export type LaborItemInput = z.infer<typeof laborItemSchema>;

export const laborOrderSchema = z.object({
  workOrderId: z.coerce.number().int().positive("Orden requerida"),
  desab: z.string().max(150).optional().or(z.literal("")),
  disassembler: z.string().max(150).optional().or(z.literal("")),
  prep: z.string().max(150).optional().or(z.literal("")),
  painter: z.string().max(150).optional().or(z.literal("")),
  polisher: z.string().max(150).optional().or(z.literal("")),
  items: z.array(laborItemSchema).min(1, "Agrega al menos una pieza"),
});

export type LaborOrderInput = z.output<typeof laborOrderSchema>;
export type LaborOrderFormValues = z.input<typeof laborOrderSchema>;
