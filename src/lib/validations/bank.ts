import { z } from "zod";

export const BANK_ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Cuenta corriente" },
  { value: "SAVINGS", label: "Cuenta de ahorros" },
  { value: "CREDIT", label: "Tarjeta de crédito" },
] as const;

export const CURRENCIES = [
  { value: "DOP", label: "RD$ (DOP)" },
  { value: "USD", label: "US$ (USD)" },
] as const;

export const bankAccountSchema = z.object({
  accountName: z.string().min(1, "Nombre de cuenta requerido").max(150),
  bankName: z.string().min(1, "Nombre del banco requerido").max(100),
  accountNumber: z.string().max(50).optional().or(z.literal("")),
  accountType: z.string().max(20).optional().or(z.literal("")),
  currency: z.string().max(3).optional().or(z.literal("")),
  initialBalance: z.coerce.number().optional().default(0),
  notes: z.string().max(250).optional().or(z.literal("")),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;

export const TRANSACTION_TYPES = [
  { value: "CREDIT", label: "Ingreso (crédito)" },
  { value: "DEBIT", label: "Egreso (débito)" },
] as const;

export const bankTransactionSchema = z.object({
  bankAccountId: z.coerce.number().int().positive("Selecciona una cuenta"),
  transactionType: z.enum(["CREDIT", "DEBIT"]),
  amount: z.coerce.number().positive("Monto debe ser mayor a 0"),
  description: z.string().min(1, "Descripción requerida").max(250),
  reference: z.string().max(100).optional().or(z.literal("")),
  transactionDate: z.string().min(1, "Fecha requerida"),
  category: z.string().max(50).optional().or(z.literal("")),
  notes: z.string().max(250).optional().or(z.literal("")),
});

export type BankTransactionInput = z.infer<typeof bankTransactionSchema>;
