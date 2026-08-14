import { z } from "zod";

/** Tarea de mano de obra personalizada (catálogo por taller). Máx 50 chars: `QuotationLaborLine.Area` es VARCHAR(50). */
export const quotationTaskTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nombre requerido (mínimo 2 letras)")
    .max(50, "Máximo 50 caracteres"),
});

export type QuotationTaskTypeInput = z.infer<typeof quotationTaskTypeSchema>;
