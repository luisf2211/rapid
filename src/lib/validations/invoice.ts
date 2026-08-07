import { z } from "zod";

export const createInvoiceSchema = z.object({
  workOrderId: z.coerce.number().int().positive("Selecciona una orden"),
  discountAmount: z.coerce.number().min(0).default(0),
  notes: z.string().max(8000).optional().or(z.literal("")),
  /** Para cotizaciones de seguro: filtrar líneas por tipo de facturación */
  billingFilter: z.enum(["ALL", "INSURANCE", "CLIENT"]).default("ALL"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const invoiceLineInputSchema = z.object({
  lineType: z.enum(["LABOR", "MATERIAL", "PART", "OTHER"]),
  description: z.string().min(1, "Descripción requerida").max(250),
  quantity: z.number().positive("Cantidad inválida"),
  unitPrice: z.number().min(0, "Precio inválido"),
});

export const updateInvoiceSchema = z.object({
  id: z.number().int().positive(),
  customerName: z.string().min(1, "Nombre del cliente requerido").max(150),
  nationalId: z.string().max(30).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().max(150).optional().or(z.literal("")),
  address: z.string().max(250).optional().or(z.literal("")),
  brand: z.string().max(80).optional().or(z.literal("")),
  model: z.string().max(80).optional().or(z.literal("")),
  vehicleYear: z.number().int().min(1900).max(2100).nullable().optional(),
  plate: z.string().max(30).optional().or(z.literal("")),
  vin: z.string().max(30).optional().or(z.literal("")),
  billingType: z.enum(["PRIVATE", "INSURANCE"]),
  discountAmount: z.number().min(0),
  notes: z.string().max(8000).optional().or(z.literal("")),
  invoiceDate: z.string().optional().or(z.literal("")),
  lines: z.array(invoiceLineInputSchema).min(1, "Agrega al menos una línea"),
  syncFromWorkOrder: z.boolean().optional(),
});

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
