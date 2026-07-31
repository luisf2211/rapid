import { z } from "zod";
import {
  DAMAGE_SIDES,
  DAMAGE_TYPES,
  QUOTATION_LABOR_AREA_VALUES,
} from "@/lib/constants";

const optionalStr = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const quotationLaborLineSchema = z.object({
  area: z.enum(QUOTATION_LABOR_AREA_VALUES),
  description: optionalStr(250),
  lineTotal: z.coerce.number().min(0).default(0),
});

export const quotationMaterialLineSchema = z.object({
  inventoryPartId: z.coerce.number().int().optional(),
  productName: z.string().min(1, "Nombre requerido").max(150),
  quantity: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  unit: optionalStr(20),
  unitPrice: z.coerce.number().min(0),
});

export const quotationPartLineSchema = z.object({
  partName: z.string().min(1, "Repuesto requerido").max(150),
  description: optionalStr(250),
  quantity: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  unitPrice: z.coerce.number().min(0),
});

export const quotationPhotoSchema = z.object({
  photoUrl: z.string().min(1, "Imagen requerida").max(500),
  category: z
    .enum(["INSPECTION", "BEFORE", "DURING", "AFTER"])
    .default("INSPECTION"),
  description: z.string().max(250).optional().or(z.literal("")),
});

export type QuotationPhotoInput = z.infer<typeof quotationPhotoSchema>;

export const quotationDamageSchema = z.object({
  partName: optionalStr(150),
  vehicleSide: z.enum(DAMAGE_SIDES.map((d) => d.value) as [string, ...string[]]).optional(),
  damageType: z.enum(DAMAGE_TYPES.map((d) => d.value) as [string, ...string[]]).optional(),
  description: optionalStr(500),
});

export const quotationSchema = z
  .object({
    quotationType: z.enum(["PRIVATE", "INSURANCE"]).default("PRIVATE"),
    submitStatus: z.enum(["DRAFT", "PENDING"]).default("DRAFT"),
    validUntil: optionalStr(10),
    customerName: z.string().min(2, "Nombre del cliente requerido").max(150),
    phone: optionalStr(50),
    email: z
      .string()
      .max(150)
      .email("Email inválido")
      .optional()
      .or(z.literal("")),
    nationalId: optionalStr(30),
    address: optionalStr(250),
    brand: optionalStr(80),
    model: optionalStr(80),
    vehicleYear: z.coerce.number().int().min(1900).max(2100).optional(),
    color: optionalStr(50),
    plate: optionalStr(30),
    vin: optionalStr(30),
    mileage: optionalStr(50),
    mileageUnit: z.enum(["km", "mi"]).default("mi"),
    insuranceCompany: optionalStr(150),
    insurerRnc: optionalStr(30),
    policyNumber: optionalStr(80),
    claimNumber: optionalStr(80),
    adjusterName: optionalStr(150),
    adjusterPhone: optionalStr(50),
    deductibleAmount: z.coerce.number().min(0).optional(),
    discountAmount: z.coerce.number().min(0).default(0),
    estimatedDays: z.coerce.number().int().min(0).optional(),
    warrantyNotes: optionalStr(500),
    termsNotes: optionalStr(8000),
    internalNotes: optionalStr(8000),
    laborLines: z.array(quotationLaborLineSchema).default([]),
    materialLines: z.array(quotationMaterialLineSchema).default([]),
    partLines: z.array(quotationPartLineSchema).default([]),
    damages: z.array(quotationDamageSchema).default([]),
    photos: z.array(quotationPhotoSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.quotationType === "INSURANCE" && !data.insuranceCompany?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Compañía aseguradora requerida",
        path: ["insuranceCompany"],
      });
    }
    const hasLines =
      data.laborLines.length > 0 || data.partLines.length > 0;
    if (!hasLines) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agrega al menos una línea de mano de obra o repuesto",
        path: ["laborLines"],
      });
    }
  });

export type QuotationInput = z.infer<typeof quotationSchema>;

/** Valores del formulario (coerce en submit). */
export type QuotationFormValues = z.input<typeof quotationSchema>;
