import { z } from "zod";

export const PETTY_CASH_TRANSACTION_TYPES = [
  { value: "DISBURSEMENT", label: "Desembolso (gasto)" },
  { value: "REPLENISHMENT", label: "Reposición (recarga)" },
] as const;

export const pettyCashFundSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  fundLimit: z.coerce.number().positive("Límite debe ser mayor a 0"),
  custodian: z.string().max(150).optional().or(z.literal("")),
});

export type PettyCashFundInput = z.output<typeof pettyCashFundSchema>;

export type PettyCashFundFormValues = {
  name: string;
  fundLimit: number;
  custodian?: string;
};

export const pettyCashTransactionSchema = z.object({
  pettyCashFundId: z.coerce.number().int().positive("Selecciona un fondo"),
  transactionType: z.enum(["DISBURSEMENT", "REPLENISHMENT"]),
  amount: z.coerce.number().positive("Monto debe ser mayor a 0"),
  description: z.string().min(1, "Descripción requerida").max(250),
  transactionDate: z.string().min(1, "Fecha requerida"),
  notes: z.string().max(250).optional().or(z.literal("")),
});

export type PettyCashTransactionInput = z.output<typeof pettyCashTransactionSchema>;

export type PettyCashTransactionFormValues = {
  pettyCashFundId: number;
  transactionType: "DISBURSEMENT" | "REPLENISHMENT";
  amount: number;
  description: string;
  transactionDate: string;
  notes?: string;
};
