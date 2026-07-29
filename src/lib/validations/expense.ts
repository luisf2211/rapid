import { z } from "zod";

export const EXPENSE_PAYMENT_METHODS = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CARD", label: "Tarjeta" },
  { value: "CHECK", label: "Cheque" },
  { value: "PETTY_CASH", label: "Caja chica" },
  { value: "OTHER", label: "Otro" },
] as const;

export const expenseFormSchema = z.object({
  categoryId: z.string().min(1, "Categoría requerida").max(100),
  description: z.string().min(1, "Descripción requerida").max(250),
  amount: z.coerce.number().positive("Monto debe ser mayor a 0"),
  expenseDate: z.string().min(1, "Fecha requerida"),
  supplier: z.string().max(150).optional().or(z.literal("")),
  reference: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  paymentMethod: z.string().max(30).optional().or(z.literal("")),
  bankAccountId: z.coerce.number().int().optional().nullable(),
});

export type ExpenseFormInput = z.output<typeof expenseFormSchema>;

/** Form values type (inputs are strings before coercion). */
export type ExpenseFormValues = {
  categoryId: string;
  description: string;
  amount: number;
  expenseDate: string;
  supplier?: string;
  reference?: string;
  notes?: string;
  paymentMethod?: string;
  bankAccountId?: number | null;
};

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color inválido")
    .optional()
    .or(z.literal("")),
});

export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;
