import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Correo requerido")
    .refine((value) => {
      const v = value.trim().toLowerCase();
      if (v === "admin") return true;
      return z.string().email().safeParse(v).success;
    }, "Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createCompanySchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(150),
  slug: z
    .string()
    .min(2, "Identificador requerido")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  adminEmail: z.string().email("Correo inválido"),
  adminPassword: z.string().min(4, "Mínimo 4 caracteres"),
  adminFullName: z.string().max(150).optional().or(z.literal("")),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const createUserSchema = z.object({
  companyId: z.coerce.number().int().positive("Empresa requerida"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
  fullName: z.string().max(150).optional().or(z.literal("")),
  role: z.enum(["COMPANY_ADMIN", "COMPANY_USER"]).default("COMPANY_USER"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
