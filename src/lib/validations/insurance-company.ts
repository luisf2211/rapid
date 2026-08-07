import { z } from "zod";

export const insuranceCompanySchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(150),
  rnc: z.string().trim().max(30).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email inválido"),
  contactName: z.string().trim().max(150).optional().or(z.literal("")),
  address: z.string().trim().max(250).optional().or(z.literal("")),
});

export type InsuranceCompanyInput = z.infer<typeof insuranceCompanySchema>;
