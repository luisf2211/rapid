import { z } from "zod";
import { computeLaborLineAmount } from "@/lib/labor-order/piece-count";

export const laborItemSchema = z.object({
  partName: z.string().min(1, "Nombre de pieza requerido").max(150),
  quantity: z.coerce
    .number()
    .positive("Cantidad debe ser mayor a 0")
    .default(1),
  unitPrice: z.coerce
    .number()
    .nonnegative("Precio no puede ser negativo")
    .default(0),
});

export type LaborItemInput = z.infer<typeof laborItemSchema>;

export const laborOrderSchema = z.object({
  workOrderId: z.coerce.number().int().positive("Orden requerida"),
  employeeId: z.coerce.number().int().positive("Empleado requerido"),
  items: z.array(laborItemSchema).min(1, "Agrega al menos una pieza"),
});

export type LaborOrderInput = z.output<typeof laborOrderSchema>;
export type LaborOrderFormValues = z.input<typeof laborOrderSchema>;

export function laborLineAmountFromInput(item: LaborItemInput): number {
  return computeLaborLineAmount(Number(item.quantity), Number(item.unitPrice));
}
