import { z } from "zod";
import { parseFractionQuantity } from "@/lib/formatters/fraction-quantity";

function fractionIssue(message: string) {
  return { code: z.ZodIssueCode.custom, message } as const;
}

export const positiveFractionQuantitySchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const parsed = parseFractionQuantity(value);
    if (parsed == null || parsed <= 0) {
      ctx.addIssue(
        fractionIssue("Cantidad inválida (ej. 1/8, 1 octavo, 0.5)"),
      );
      return z.NEVER;
    }
    return parsed;
  });

export const nonNegativeFractionQuantitySchema = z
  .union([z.number(), z.string(), z.literal("")])
  .transform((value, ctx) => {
    if (value === "" || value == null) return undefined;
    const parsed = parseFractionQuantity(value);
    if (parsed == null || parsed < 0) {
      ctx.addIssue(
        fractionIssue("Cantidad inválida (ej. 1/8, 1 octavo, 0)"),
      );
      return z.NEVER;
    }
    return parsed;
  });

export const nonNegativeFractionQuantityRequiredSchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const parsed = parseFractionQuantity(value);
    if (parsed == null || parsed < 0) {
      ctx.addIssue(
        fractionIssue("Cantidad inválida (ej. 1/8, 1 octavo, 0)"),
      );
      return z.NEVER;
    }
    return parsed;
  });
