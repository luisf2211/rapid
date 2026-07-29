import { z } from "zod";
import { USER_ROLES } from "@/lib/auth/constants";
import { ALL_MODULE_KEYS } from "@/lib/auth/permissions";

export const createUserSchema = z.object({
  email: z.string().email("Correo electrónico inválido").max(150),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
  fullName: z.string().min(1, "Nombre requerido").max(150),
  role: z.enum([USER_ROLES.COMPANY_ADMIN, USER_ROLES.COMPANY_USER]),
  permissions: z.array(z.enum(ALL_MODULE_KEYS as [string, ...string[]])).default([]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(1, "Nombre requerido").max(150),
  role: z.enum([USER_ROLES.COMPANY_ADMIN, USER_ROLES.COMPANY_USER]),
  permissions: z.array(z.enum(ALL_MODULE_KEYS as [string, ...string[]])).default([]),
  isActive: z.boolean(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
});
