import { prisma } from "@/lib/prisma";
import { CHECKLIST_ITEMS } from "@/lib/constants";
import { checklistFieldToDbItemName } from "@/lib/checklist";
import {
  computeQuotationTotals,
  lineTotalFromQtyPrice,
  quotationTaxRate,
} from "@/lib/quotation/totals";
import type { QuotationInput, QuotationPhotoInput } from "@/lib/validations/quotation";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { Prisma } from "@prisma/client";

const EDITABLE_PHOTO_STATUSES = new Set(["DRAFT", "PENDING", "APPROVED"]);

function assertQuotationPhotosEditable(status: string) {
  if (!EDITABLE_PHOTO_STATUSES.has(status)) {
    throw new Error("No se pueden modificar fotos en esta cotización");
  }
}

function mapQuotationCategoryToWorkOrderPhoto(category: string | null): string {
  switch (category) {
    case "BEFORE":
      return "BEFORE";
    case "AFTER":
      return "AFTER";
    case "DURING":
      return "GENERAL";
    case "INSPECTION":
    default:
      return "DAMAGE";
  }
}

async function generateQuotationNumber(companyId: number): Promise<number> {
  const max = await prisma.quotation.aggregate({
    where: companyWhere(companyId),
    _max: { quotationNumber: true },
  });
  return (max._max.quotationNumber ?? 0) + 1;
}

async function generateOrderNumber(companyId: number): Promise<number> {
  const max = await prisma.workOrder.aggregate({
    where: companyWhere(companyId),
    _max: { orderNumber: true },
  });
  return (max._max.orderNumber ?? 0) + 1;
}

function parseDateOnly(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  return new Date(`${value.trim()}T00:00:00.000Z`);
}

function buildLines(input: QuotationInput) {
  const laborLines = input.laborLines.map((l, i) => ({
    area: l.area,
    description: l.description?.trim() || null,
    estimatedHours: null,
    hourlyRate: null,
    lineTotal: Number(l.lineTotal) || 0,
    sortOrder: i,
  }));

  // Materiales gastables no van en cotización al cliente (solo control interno vía requisiciones).
  const materialLines: {
    inventoryPartId: number | null;
    productName: string;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    lineTotal: number;
    sortOrder: number;
  }[] = [];

  const partLines = input.partLines.map((p, i) => {
    const total = lineTotalFromQtyPrice(p.quantity, p.unitPrice);
    return {
      partName: p.partName.trim(),
      description: p.description?.trim() || null,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      lineTotal: total,
      sortOrder: i,
    };
  });

  const taxRate = quotationTaxRate(input.quotationType);
  const totals = computeQuotationTotals({
    laborLines,
    materialLines,
    partLines,
    discountAmount: input.discountAmount,
    taxRate,
  });

  return { laborLines, materialLines, partLines, totals, taxRate };
}

function quotationHeaderData(
  input: QuotationInput,
  status: string,
  totals: ReturnType<typeof computeQuotationTotals>,
  taxRate: number,
) {
  return {
    quotationType: input.quotationType,
    status,
    validUntil: parseDateOnly(input.validUntil),
    customerName: input.customerName.trim(),
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    nationalId: input.nationalId?.trim() || null,
    address: input.address?.trim() || null,
    brand: input.brand?.trim() || null,
    model: input.model?.trim() || null,
    vehicleYear: input.vehicleYear ?? null,
    color: input.color?.trim() || null,
    plate: input.plate?.trim() || null,
    vin: input.vin?.trim() || null,
    mileage: input.mileage?.trim() || null,
    mileageUnit: input.mileageUnit || null,
    insuranceCompany:
      input.quotationType === "INSURANCE" ? input.insuranceCompany?.trim() || null : null,
    insurerRnc:
      input.quotationType === "INSURANCE" ? input.insurerRnc?.trim() || null : null,
    policyNumber:
      input.quotationType === "INSURANCE"
        ? input.policyNumber?.trim() || null
        : null,
    claimNumber: input.claimNumber?.trim() || null,
    adjusterName: input.adjusterName?.trim() || null,
    adjusterPhone: input.adjusterPhone?.trim() || null,
    deductibleAmount:
      input.quotationType === "INSURANCE" &&
      input.deductibleAmount != null &&
      input.deductibleAmount > 0
        ? input.deductibleAmount
        : null,
    laborSubtotal: totals.laborSubtotal,
    materialSubtotal: totals.materialSubtotal,
    partsSubtotal: totals.partsSubtotal,
    taxRate,
    taxAmount: totals.taxAmount,
    discountAmount: input.discountAmount,
    grandTotal: totals.grandTotal,
    estimatedDays: input.estimatedDays ?? null,
    warrantyNotes: input.warrantyNotes?.trim() || null,
    termsNotes: input.termsNotes?.trim() || null,
    internalNotes: input.internalNotes?.trim() || null,
    updatedAt: new Date(),
  };
}

export async function listQuotations(params?: {
  search?: string;
  status?: string;
  take?: number;
}) {
  const companyId = await requireCompanyIdFromSession();
  const where: Prisma.QuotationWhereInput = { ...companyWhere(companyId) };
  if (params?.status) where.status = params.status;
  if (params?.search) {
    const s = params.search.trim();
    const asNumber = Number(s);
    const or: Prisma.QuotationWhereInput[] = [
      { customerName: { contains: s, mode: "insensitive" } },
      { plate: { contains: s, mode: "insensitive" } },
      { brand: { contains: s, mode: "insensitive" } },
      { model: { contains: s, mode: "insensitive" } },
    ];
    if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
      or.push({ quotationNumber: asNumber });
    }
    where.OR = or;
  }

  return prisma.quotation.findMany({
    where,
    take: params?.take,
    orderBy: { id: "desc" },
    include: {
      workOrder: { select: { id: true, orderNumber: true } },
    },
  });
}

export async function getQuotationById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.quotation.findFirst({
    where: { id, ...companyWhere(companyId) },
    include: {
      laborLines: { orderBy: { sortOrder: "asc" } },
      materialLines: { orderBy: { sortOrder: "asc" }, include: { inventoryPart: true } },
      partLines: { orderBy: { sortOrder: "asc" } },
      damages: { orderBy: { id: "asc" } },
      photos: { orderBy: { id: "asc" } },
      workOrder: { select: { id: true, orderNumber: true, status: true } },
    },
  });
}

export async function createQuotation(input: QuotationInput) {
  const companyId = await requireCompanyIdFromSession();
  const quotationNumber = await generateQuotationNumber(companyId);
  const status = input.submitStatus === "PENDING" ? "PENDING" : "DRAFT";
  const { laborLines, materialLines, partLines, totals, taxRate } = buildLines(input);

  const damages = input.damages
    .filter((d) => d.vehicleSide || d.damageType || d.description?.trim())
    .map((d) => ({
      partName: d.partName?.trim() || null,
      vehicleSide: d.vehicleSide ?? null,
      damageType: d.damageType ?? null,
      description: d.description?.trim() || null,
    }));

  const photos = (input.photos ?? [])
    .filter((p) => p.photoUrl?.trim())
    .map((p) => ({
      photoUrl: p.photoUrl.trim(),
      category: p.category ?? "INSPECTION",
      description: p.description?.trim() || null,
    }));

  return prisma.quotation.create({
    data: {
      quotationNumber,
      company: { connect: { id: companyId } },
      ...quotationHeaderData(input, status, totals, taxRate),
      laborLines: { create: laborLines },
      materialLines: { create: materialLines },
      partLines: { create: partLines },
      damages: damages.length ? { create: damages } : undefined,
      photos: photos.length ? { create: photos } : undefined,
    },
  });
}

export async function updateQuotation(
  id: number,
  input: QuotationInput,
  options?: { preserveStatus?: boolean },
) {
  const existing = await prisma.quotation.findUnique({ where: { id } });
  if (!existing) throw new Error("Cotización no encontrada");

  const status = options?.preserveStatus
    ? existing.status
    : input.submitStatus === "PENDING"
      ? "PENDING"
      : "DRAFT";

  const { laborLines, materialLines, partLines, totals, taxRate } =
    buildLines(input);

  const damages = input.damages
    .filter((d) => d.vehicleSide || d.damageType || d.description?.trim())
    .map((d) => ({
      partName: d.partName?.trim() || null,
      vehicleSide: d.vehicleSide ?? null,
      damageType: d.damageType ?? null,
      description: d.description?.trim() || null,
    }));

  return prisma.$transaction(async (tx) => {
    await tx.quotationLaborLine.deleteMany({ where: { quotationId: id } });
    await tx.quotationMaterialLine.deleteMany({ where: { quotationId: id } });
    await tx.quotationPartLine.deleteMany({ where: { quotationId: id } });
    if (damages.length > 0) {
      await tx.quotationDamage.deleteMany({ where: { quotationId: id } });
    }

    return tx.quotation.update({
      where: { id },
      data: {
        ...quotationHeaderData(input, status, totals, taxRate),
        laborLines: { create: laborLines },
        materialLines: { create: materialLines },
        partLines: { create: partLines },
        damages:
          damages.length > 0 ? { create: damages } : undefined,
      },
      include: {
        laborLines: true,
        materialLines: true,
        partLines: true,
        damages: true,
        photos: true,
      },
    });
  });
}

export async function deleteQuotation(id: number) {
  const q = await prisma.quotation.findUnique({ where: { id } });
  if (!q) throw new Error("Cotización no encontrada");
  if (q.status === "CONVERTED" || q.workOrderId) {
    throw new Error(
      "No se puede eliminar: ya tiene orden de recepción. Elimina o archiva la orden primero.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.workOrder.updateMany({
      where: { quotationId: id },
      data: { quotationId: null },
    });
    await tx.quotation.delete({ where: { id } });
  });
}

export async function addQuotationPhotos(
  quotationId: number,
  photos: QuotationPhotoInput[],
) {
  const q = await prisma.quotation.findUnique({ where: { id: quotationId } });
  if (!q) throw new Error("Cotización no encontrada");
  assertQuotationPhotosEditable(q.status);

  const rows = photos
    .filter((p) => p.photoUrl?.trim())
    .map((p) => ({
      quotationId,
      photoUrl: p.photoUrl.trim(),
      category: p.category ?? "INSPECTION",
      description: p.description?.trim() || null,
    }));

  if (rows.length === 0) return [];

  await prisma.quotationPhoto.createMany({ data: rows });
  await prisma.quotation.update({
    where: { id: quotationId },
    data: { updatedAt: new Date() },
  });

  return prisma.quotationPhoto.findMany({
    where: { quotationId },
    orderBy: { id: "asc" },
  });
}

export async function deleteQuotationPhoto(
  quotationId: number,
  photoId: number,
) {
  const q = await prisma.quotation.findUnique({ where: { id: quotationId } });
  if (!q) throw new Error("Cotización no encontrada");
  assertQuotationPhotosEditable(q.status);

  const photo = await prisma.quotationPhoto.findFirst({
    where: { id: photoId, quotationId },
  });
  if (!photo) throw new Error("Foto no encontrada");

  await prisma.quotationPhoto.delete({ where: { id: photoId } });
  await prisma.quotation.update({
    where: { id: quotationId },
    data: { updatedAt: new Date() },
  });
}

export async function approveQuotation(id: number, approvedBy?: string) {
  const q = await prisma.quotation.findUnique({ where: { id } });
  if (!q) throw new Error("Cotización no encontrada");
  if (q.status !== "PENDING" && q.status !== "DRAFT") {
    throw new Error("Solo se pueden aprobar cotizaciones en borrador o pendientes");
  }
  return prisma.quotation.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: approvedBy?.trim() || "Taller",
      updatedAt: new Date(),
    },
  });
}

export async function rejectQuotation(
  id: number,
  reason: string,
  rejectedBy?: string,
) {
  const q = await prisma.quotation.findUnique({ where: { id } });
  if (!q) throw new Error("Cotización no encontrada");
  if (q.status !== "PENDING" && q.status !== "DRAFT") {
    throw new Error("No se puede rechazar esta cotización");
  }
  return prisma.quotation.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectedBy: rejectedBy?.trim() || "Taller",
      rejectionReason: reason.trim(),
      updatedAt: new Date(),
    },
  });
}

export async function convertQuotationToWorkOrder(
  id: number,
  convertedBy?: string,
) {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { damages: true, photos: true },
  });
  if (!quotation) throw new Error("Cotización no encontrada");
  if (quotation.status !== "APPROVED") {
    throw new Error("La cotización debe estar aprobada antes de crear la recepción");
  }
  if (quotation.workOrderId) {
    throw new Error("Esta cotización ya fue convertida a orden de recepción");
  }

  const orderNumber = await generateOrderNumber(quotation.CompanyId);
  const today = new Date();
  const deliveryDate = new Date(
    `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}T00:00:00.000Z`,
  );
  const deliveryTime = new Date("1970-01-01T12:00:00.000Z");

  const checklistRows = CHECKLIST_ITEMS.map((it) => ({
    itemName: checklistFieldToDbItemName(it.field),
    isChecked: false,
    comments: null,
    hasComment: false,
  }));

  const actor = convertedBy?.trim() || "Taller";

  return prisma.$transaction(async (tx) => {
    const workOrder = await tx.workOrder.create({
      data: {
        orderNumber,
        CompanyId: quotation.CompanyId,
        quotationId: quotation.id,
        status: "RECEIVED",
        customerName: quotation.customerName,
        phone: quotation.phone,
        email: quotation.email,
        address: quotation.address,
        brand: quotation.brand,
        model: quotation.model,
        vehicleYear: quotation.vehicleYear,
        color: quotation.color,
        plate: quotation.plate,
        mileage: quotation.mileage,
        notes: quotation.internalNotes,
        updatedAt: new Date(),
        receptions: {
          create: {
            deliveryDate,
            deliveryTime,
            fuelLevel: 50,
            observations: `Recepción generada desde cotización #${quotation.quotationNumber}. Complete el checklist en el detalle de la orden.`,
            receivedBy: actor,
            checklist: { create: checklistRows },
          },
        },
        damages: {
          create: quotation.damages
            .filter((d) => d.vehicleSide && d.damageType)
            .map((d) => ({
              vehicleSide: d.vehicleSide!,
              damageType: d.damageType!,
              description: d.description || d.partName,
              positionX: d.positionX,
              positionY: d.positionY,
            })),
        },
        photos: {
          create: quotation.photos.map((p) => ({
            photoUrl: p.photoUrl,
            photoType: mapQuotationCategoryToWorkOrderPhoto(p.category),
            description: p.description,
          })),
        },
      },
    });

    await tx.quotation.update({
      where: { id: quotation.id },
      data: {
        status: "CONVERTED",
        workOrderId: workOrder.id,
        convertedAt: new Date(),
        convertedBy: actor,
        updatedAt: new Date(),
      },
    });

    return workOrder;
  });
}
