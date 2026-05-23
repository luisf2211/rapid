import { z } from "zod";

export const materialItemSchema = z.object({
  productName: z.string().min(1, "Producto requerido").max(150),
  quantity: z.coerce.number().min(0, "Cantidad inválida").default(1),
  unitPrice: z.coerce.number().min(0, "Precio inválido").default(0),
  total: z.coerce.number().min(0).default(0),
  assignedEmployee: z.string().max(150).optional().or(z.literal("")),
});

export type MaterialItemInput = z.infer<typeof materialItemSchema>;

export const materialRequisitionSchema = z.object({
  workOrderId: z.coerce.number().int().positive("Orden requerida"),
  desab: z.string().max(150).optional().or(z.literal("")), // Desabollador
  disassembler: z.string().max(150).optional().or(z.literal("")), // Desarme
  prep: z.string().max(150).optional().or(z.literal("")), // Preparador
  painter: z.string().max(150).optional().or(z.literal("")), // Pintor
  polisher: z.string().max(150).optional().or(z.literal("")), // Pulidor
  items: z
    .array(materialItemSchema)
    .min(1, "Agrega al menos un material"),
});

export type MaterialRequisitionInput = z.output<typeof materialRequisitionSchema>;
export type MaterialRequisitionFormValues = z.input<typeof materialRequisitionSchema>;
