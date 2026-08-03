import { z } from "zod";

export const workshopSettingsSchema = z.object({
  businessName: z.string().trim().min(1, "Nombre del taller requerido").max(150),
  legalName: z.string().trim().max(200).optional().or(z.literal("")),
  rnc: z.string().trim().max(30).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email inválido"),
  address: z.string().trim().max(250).optional().or(z.literal("")),
  logoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  stampUrl: z.string().trim().max(500).optional().or(z.literal("")),
  defaultTaxRate: z.number().min(0).max(1),
  quotationFooter: z.string().trim().max(2000).optional().or(z.literal("")),
  quotationWarrantyNotes: z.string().trim().max(2000).optional().or(z.literal("")),
  quotationPaymentNotes: z.string().trim().max(2000).optional().or(z.literal("")),
  invoiceFooter: z.string().trim().max(2000).optional().or(z.literal("")),
  brandColor: z.string().trim().max(7).regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal inválido").optional().or(z.literal("")),
  updatedBy: z.string().trim().max(150).optional().or(z.literal("")),
});

export type WorkshopSettingsInput = z.infer<typeof workshopSettingsSchema>;
export type WorkshopSettingsFormValues = WorkshopSettingsInput;
