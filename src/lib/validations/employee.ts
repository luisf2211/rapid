import { z } from "zod";
import { LABOR_TECHNICIAN_ROLES } from "@/lib/constants";

export const employeeSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(150),
  role: z
    .string()
    .min(1, "Rol requerido")
    .refine(
      (v) => LABOR_TECHNICIAN_ROLES.includes(v as (typeof LABOR_TECHNICIAN_ROLES)[number]),
      "Selecciona un rol válido",
    ),
  phone: z.string().max(50).optional().or(z.literal("")),
  nationalId: z.string().max(30).optional().or(z.literal("")),
  defaultUnitPrice: z.coerce.number().nonnegative().default(0),
  isExternal: z.boolean().default(false),
  isActive: z.boolean().default(true),
  hiredAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type EmployeeInput = z.output<typeof employeeSchema>;
export type EmployeeFormValues = z.input<typeof employeeSchema>;

export const advancePaymentSchema = z.object({
  employeeId: z.coerce.number().int().positive("Empleado requerido"),
  amount: z.coerce.number().positive("Monto debe ser mayor a 0"),
  paymentDate: z.string().min(1, "Fecha requerida"),
  paymentMethod: z.string().max(30).optional().or(z.literal("")),
  reference: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  paidBy: z.string().max(150).optional().or(z.literal("")),
  laborOrderItemIds: z
    .array(z.coerce.number().int().positive())
    .optional()
    .default([]),
});

export type AdvancePaymentInput = z.output<typeof advancePaymentSchema>;

export const payrollPaySchema = z.object({
  settlementId: z.coerce.number().int().positive(),
  paymentDate: z.string().min(1, "Fecha requerida"),
  paymentMethod: z.string().max(30).optional().or(z.literal("")),
  reference: z.string().max(100).optional().or(z.literal("")),
  paidBy: z.string().max(150).optional().or(z.literal("")),
});

export type PayrollPayInput = z.output<typeof payrollPaySchema>;

export const payrollAdjustmentSchema = z.object({
  settlementId: z.coerce.number().int().positive(),
  adjustmentsAmount: z.coerce.number(),
  adjustmentNote: z.string().max(250).optional().or(z.literal("")),
});

export type PayrollAdjustmentInput = z.output<typeof payrollAdjustmentSchema>;

export type AdvancePaymentFormValues = z.input<typeof advancePaymentSchema>;
