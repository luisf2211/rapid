import { z } from "zod";

export const materialItemSchema = z.object({
  inventoryPartId: z.coerce
    .number()
    .int()
    .positive("Selecciona una pieza del inventario"),
  quantity: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  unitPrice: z.coerce.number().min(0, "Precio inválido").default(0),
  assignedEmployee: z.string().max(150).optional().or(z.literal("")),
});

export type MaterialItemInput = z.infer<typeof materialItemSchema>;

export const materialRequisitionSchema = z
  .object({
    workOrderId: z.coerce.number().int().positive("Orden requerida"),
    items: z.array(materialItemSchema).min(1, "Agrega al menos un material"),
  })
  .superRefine((data, ctx) => {
    const ids = data.items.map((i) => i.inventoryPartId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puedes repetir la misma pieza en la requisición",
        path: ["items"],
      });
    }
  });

export type MaterialRequisitionInput = z.output<typeof materialRequisitionSchema>;
export type MaterialRequisitionFormValues = z.input<
  typeof materialRequisitionSchema
>;
