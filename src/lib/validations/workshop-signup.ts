import { z } from "zod";
import { SERVICES } from "@/lib/content/services";

const serviceNames = SERVICES.map((s) => s.name);

/**
 * Registro self-service de taller. Reúne cuenta del owner + datos del taller
 * + servicios + perfil público en un solo submit (formulario multipaso).
 */
export const workshopSignupSchema = z.object({
  // Paso 1: cuenta del owner
  ownerFirstName: z.string().trim().min(2, "Tu nombre es requerido").max(80),
  ownerLastName: z.string().trim().min(2, "Tu apellido es requerido").max(80),
  ownerEmail: z.string().trim().min(1, "Correo requerido").max(150).email("Correo inválido"),
  ownerPhone: z.string().trim().min(7, "Teléfono requerido").max(50),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),

  // Paso 2: datos del taller
  workshopName: z.string().trim().min(2, "Nombre del taller requerido").max(150),
  rnc: z.string().trim().max(30).optional().or(z.literal("")),
  workshopPhone: z.string().trim().max(50).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(250).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Ciudad requerida").max(120),

  // Paso 3: servicios
  services: z
    .array(z.string())
    .min(1, "Selecciona al menos un servicio")
    .refine(
      (arr) => arr.every((s) => serviceNames.includes(s)),
      "Servicio inválido",
    ),

  // Paso 4: perfil
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type WorkshopSignupInput = z.infer<typeof workshopSignupSchema>;
export type WorkshopSignupValues = z.input<typeof workshopSignupSchema>;
