import { z } from "zod";
import { positiveFractionQuantitySchema } from "@/lib/validations/fraction-quantity";

export const materialRequisitionItemSchema = z.object({
  inventoryPartId: z.coerce
    .number()
    .int()
    .positive("Selecciona una pieza del inventario"),
  quantity: positiveFractionQuantitySchema,
  unitPrice: z.coerce.number().min(0, "Precio inválido").default(0),
  assignedEmployee: z.string().max(150).optional().or(z.literal("")),
});

const materialRequisitionLineDraftSchema = z.object({
  inventoryPartId: z.coerce.number().int().default(0),
  quantity: z
    .union([positiveFractionQuantitySchema, z.coerce.number(), z.string()])
    .default(1),
  unitPrice: z.coerce.number().min(0, "Precio inválido").default(0),
  assignedEmployee: z.string().max(150).optional().or(z.literal("")),
});

export type MaterialRequisitionItemInput = z.infer<
  typeof materialRequisitionItemSchema
>;

function filledLines(
  items: z.infer<typeof materialRequisitionLineDraftSchema>[],
) {
  return items.filter((item) => Number(item.inventoryPartId) > 0);
}

/** Validación del formulario (permite filas vacías mientras se edita). */
export const materialRequisitionFormSchema = z
  .object({
    workOrderId: z.coerce.number().int().positive("Orden requerida"),
    materialItems: z.array(materialRequisitionLineDraftSchema).default([]),
    paintItems: z.array(materialRequisitionLineDraftSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const materialItems = filledLines(data.materialItems);
    const paintItems = filledLines(data.paintItems);
    const allItems = [...materialItems, ...paintItems];

    if (allItems.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agrega al menos un material o pintura",
        path: ["materialItems"],
      });
      return;
    }

    if (allItems.length > 500) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Máximo 500 líneas por requisición",
        path: ["materialItems"],
      });
    }

    for (const [section, items, source] of [
      ["materialItems", materialItems, data.materialItems] as const,
      ["paintItems", paintItems, data.paintItems] as const,
    ]) {
      for (let idx = 0; idx < source.length; idx++) {
        if (Number(source[idx]?.inventoryPartId) <= 0) continue;
        const parsed = materialRequisitionItemSchema.safeParse(source[idx]);
        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            ctx.addIssue({
              ...issue,
              path: [section, idx, ...issue.path],
            });
          }
        }
      }
    }

    const ids = allItems.map((i) => Number(i.inventoryPartId));
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puedes repetir la misma pieza en la requisición",
        path: ["materialItems"],
      });
    }
  });

/** Payload final enviado al servidor (solo líneas completas). */
export const materialRequisitionSchema = z.object({
  workOrderId: z.coerce.number().int().positive("Orden requerida"),
  materialItems: z.array(materialRequisitionItemSchema),
  paintItems: z.array(materialRequisitionItemSchema),
});

export type MaterialRequisitionInput = z.infer<typeof materialRequisitionSchema>;
export type MaterialRequisitionFormValues = z.input<
  typeof materialRequisitionFormSchema
>;

export function toMaterialRequisitionInput(
  data: MaterialRequisitionFormValues,
): MaterialRequisitionInput {
  const materialItems = filledLines(
    (data.materialItems ?? []) as z.infer<typeof materialRequisitionLineDraftSchema>[],
  );
  const paintItems = filledLines(
    (data.paintItems ?? []) as z.infer<typeof materialRequisitionLineDraftSchema>[],
  );

  return materialRequisitionSchema.parse({
    workOrderId: data.workOrderId,
    materialItems,
    paintItems,
  });
}

/** @deprecated use materialRequisitionItemSchema */
export const materialItemSchema = materialRequisitionItemSchema;
/** @deprecated */
export type MaterialItemInput = MaterialRequisitionItemInput;
