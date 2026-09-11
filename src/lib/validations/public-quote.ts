import { z } from "zod";

const optionalStr = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

/**
 * Esquema de la solicitud de cotización pública (cliente final).
 * Mucho más ligero que el `quotationSchema` interno: el cliente solo
 * describe su vehículo, el trabajo y sube fotos. El taller cotiza luego.
 */
export const publicQuoteRequestSchema = z.object({
  // Taller elegido
  companySlug: z.string().trim().min(1, "Selecciona un taller"),

  // Contacto del cliente
  customerName: z
    .string()
    .trim()
    .min(2, "Dinos tu nombre")
    .max(150),
  phone: z
    .string()
    .trim()
    .min(7, "Necesitamos un teléfono para contactarte")
    .max(50),
  email: z
    .string({ message: "Necesitamos tu correo para avisarte del avance" })
    .trim()
    .min(1, "Necesitamos tu correo para avisarte del avance")
    .max(150)
    .email("Email inválido"),

  // Vehículo
  brand: optionalStr(80),
  model: optionalStr(80),
  vehicleYear: z.coerce
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional(),
  color: optionalStr(50),
  plate: optionalStr(30),

  // Trabajo solicitado
  message: z
    .string()
    .trim()
    .min(5, "Cuéntanos qué necesitas")
    .max(4000),

  // Fotos (URLs ya subidas a /api/upload)
  photos: z
    .array(
      z.object({
        photoUrl: z.string().trim().min(1).max(500),
      }),
    )
    .max(12, "Máximo 12 fotos")
    .default([]),
});

export type PublicQuoteRequestInput = z.infer<typeof publicQuoteRequestSchema>;
export type PublicQuoteRequestValues = z.input<typeof publicQuoteRequestSchema>;
