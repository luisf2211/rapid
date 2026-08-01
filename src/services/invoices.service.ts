import { prisma } from "@/lib/prisma";
import { quotationLaborAreaLabel } from "@/lib/constants";
import { computeInvoiceTotals, invoiceTaxRate } from "@/lib/invoice/totals";
import { toPlainNumber } from "@/lib/serialize";
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "@/lib/validations/invoice";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { Prisma } from "@prisma/client";

export type InvoiceLineDraft = {
  lineType: string;
  sourceType: string | null;
  sourceId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sortOrder: number;
};

export type InvoiceDraft = {
  workOrderId: number;
  orderNumber: number;
  quotationId: number | null;
  billingType: string;
  customerName: string;
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  plate: string | null;
  vin: string | null;
  laborSubtotal: number;
  materialSubtotal: number;
  partsSubtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  grandTotal: number;
  lines: InvoiceLineDraft[];
  hasLabor: boolean;
  hasMaterials: boolean;
};

async function generateInvoiceNumber(companyId: number): Promise<number> {
  const max = await prisma.invoice.aggregate({
    where: companyWhere(companyId),
    _max: { invoiceNumber: true },
  });
  return (max._max.invoiceNumber ?? 0) + 1;
}

async function findActiveInvoiceForWorkOrder(workOrderId: number) {
  return prisma.invoice.findFirst({
    where: { workOrderId, status: { not: "VOID" } },
  });
}

function num(value: unknown): number {
  return toPlainNumber(value) ?? 0;
}

export function canEditInvoice(status: string): boolean {
  return status === "INVOICED" || status === "PENDING";
}

export async function buildInvoiceDraftFromWorkOrder(
  workOrderId: number,
  discountAmount = 0,
  options?: { excludeInvoiceId?: number },
): Promise<InvoiceDraft> {
  const order = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: {
      quotation: {
        include: {
          laborLines: { orderBy: { sortOrder: "asc" } },
          partLines: { orderBy: { sortOrder: "asc" } },
        },
      },
      laborOrders: { include: { items: true }, orderBy: { id: "asc" } },
      materialRequisitions: {
        include: { items: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) throw new Error("Orden de recepción no encontrada");
  if (!order.customerName?.trim()) {
    throw new Error("La orden no tiene nombre de cliente");
  }

  const existing = await findActiveInvoiceForWorkOrder(workOrderId);
  if (existing && existing.id !== options?.excludeInvoiceId) {
    throw new Error(
      `Ya existe la factura #${existing.invoiceNumber} para esta orden`,
    );
  }

  const billingType = order.quotation?.quotationType ?? "PRIVATE";
  const taxRate = invoiceTaxRate(billingType);

  const lines: InvoiceLineDraft[] = [];
  let sort = 0;

  if (order.quotation) {
    for (const l of order.quotation.laborLines) {
      const lineTotal = num(l.lineTotal);
      if (lineTotal <= 0) continue;
      const label = quotationLaborAreaLabel(l.area);
      const desc = l.description?.trim()
        ? `${label} — ${l.description.trim()}`
        : label;
      lines.push({
        lineType: "LABOR",
        sourceType: "QUOTATION_LABOR",
        sourceId: l.id,
        description: desc,
        quantity: 1,
        unitPrice: lineTotal,
        lineTotal,
        sortOrder: sort++,
      });
    }
    for (const p of order.quotation.partLines) {
      const qty = num(p.quantity) || 1;
      const lineTotal = num(p.lineTotal);
      if (lineTotal <= 0) continue;
      const unitPrice = Math.round((lineTotal / qty) * 100) / 100;
      lines.push({
        lineType: "PART",
        sourceType: "QUOTATION_PART",
        sourceId: p.id,
        description: p.partName,
        quantity: qty,
        unitPrice,
        lineTotal,
        sortOrder: sort++,
      });
    }
  }

  // Materiales gastables no se facturan al cliente (requisiciones = control interno).

  const laborSubtotal = lines
    .filter((l) => l.lineType === "LABOR")
    .reduce((s, l) => s + l.lineTotal, 0);
  const materialSubtotal = 0;
  const partsSubtotal = lines
    .filter((l) => l.lineType === "PART")
    .reduce((s, l) => s + l.lineTotal, 0);

  if (lines.length === 0) {
    throw new Error(
      order.quotation
        ? "La cotización no tiene montos de mano de obra ni repuestos para facturar"
        : "Esta orden no tiene cotización vinculada. Factura desde una orden con cotización aprobada.",
    );
  }

  const totals = computeInvoiceTotals({
    laborSubtotal,
    materialSubtotal,
    partsSubtotal,
    discountAmount,
    taxRate,
  });

  return {
    workOrderId: order.id,
    orderNumber: order.orderNumber,
    quotationId: order.quotationId,
    billingType,
    customerName: order.customerName,
    nationalId: order.quotation?.nationalId ?? null,
    phone: order.phone,
    email: order.email,
    address: order.address,
    brand: order.brand,
    model: order.model,
    vehicleYear: order.vehicleYear,
    plate: order.plate,
    vin: order.quotation?.vin ?? null,
    laborSubtotal,
    materialSubtotal,
    partsSubtotal,
    discountAmount,
    taxRate,
    taxAmount: totals.taxAmount,
    subtotal: totals.subtotal,
    grandTotal: totals.grandTotal,
    lines,
    hasLabor: laborSubtotal > 0,
    hasMaterials: materialSubtotal > 0,
  };
}

export async function listInvoices(params?: {
  search?: string;
  status?: string;
}) {
  const companyId = await requireCompanyIdFromSession();
  const where: Prisma.InvoiceWhereInput = { ...companyWhere(companyId) };
  if (params?.status) where.status = params.status;
  if (params?.search) {
    const s = params.search.trim();
    const asNumber = Number(s);
    const or: Prisma.InvoiceWhereInput[] = [
      { customerName: { contains: s, mode: "insensitive" } },
      { plate: { contains: s, mode: "insensitive" } },
    ];
    if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
      or.push({ invoiceNumber: asNumber });
    }
    where.OR = or;
  }

  return prisma.invoice.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      workOrder: { select: { id: true, orderNumber: true } },
    },
  });
}

export async function getInvoiceById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.invoice.findFirst({
    where: { id, ...companyWhere(companyId) },
    include: {
      lines: { orderBy: { sortOrder: "asc" } },
      workOrder: { select: { id: true, orderNumber: true, status: true } },
      quotation: {
        select: {
          id: true,
          quotationNumber: true,
          insuranceCompany: true,
          policyNumber: true,
          deductibleAmount: true,
        },
      },
    },
  });
}

/** Versión pública (sin sesión) para rutas de impresión accesibles por clientes. */
export async function getInvoiceForPrint(id: number) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { sortOrder: "asc" } },
      workOrder: { select: { id: true, orderNumber: true, status: true } },
      quotation: {
        select: {
          id: true,
          quotationNumber: true,
          insuranceCompany: true,
          policyNumber: true,
          deductibleAmount: true,
        },
      },
    },
  });
}

export async function listWorkOrdersReadyToInvoice() {
  const companyId = await requireCompanyIdFromSession();
  const orders = await prisma.workOrder.findMany({
    where: {
      ...companyWhere(companyId),
      status: { in: ["RECEIVED", "IN_PROGRESS", "COMPLETED", "DELIVERED"] },
    },
    orderBy: { id: "desc" },
    take: 50,
    include: {
      _count: {
        select: { laborOrders: true, materialRequisitions: true },
      },
      invoices: { where: { status: { not: "VOID" } }, take: 1 },
    },
  });

  return orders
    .filter((o) => o.invoices.length === 0 && o.customerName)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName!,
      plate: o.plate,
      brand: o.brand,
      model: o.model,
      laborCount: o._count.laborOrders,
      materialCount: o._count.materialRequisitions,
    }));
}

export async function createInvoiceFromWorkOrder(input: CreateInvoiceInput) {
  const companyId = await requireCompanyIdFromSession();
  const draft = await buildInvoiceDraftFromWorkOrder(
    input.workOrderId,
    input.discountAmount,
  );

  const invoiceNumber = await generateInvoiceNumber(companyId);

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      CompanyId: companyId,
      status: "INVOICED",
      workOrderId: draft.workOrderId,
      quotationId: draft.quotationId,
      customerName: draft.customerName,
      nationalId: draft.nationalId,
      phone: draft.phone,
      email: draft.email,
      address: draft.address,
      brand: draft.brand,
      model: draft.model,
      vehicleYear: draft.vehicleYear,
      plate: draft.plate,
      vin: draft.vin,
      billingType: draft.billingType,
      laborSubtotal: draft.laborSubtotal,
      materialSubtotal: draft.materialSubtotal,
      partsSubtotal: draft.partsSubtotal,
      subtotal: draft.subtotal,
      discountAmount: draft.discountAmount,
      taxRate: draft.taxRate,
      taxAmount: draft.taxAmount,
      grandTotal: draft.grandTotal,
      notes: input.notes?.trim() || null,
      updatedAt: new Date(),
      lines: {
        create: draft.lines.map((l) => ({
          lineType: l.lineType,
          sourceType: l.sourceType,
          sourceId: l.sourceId,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
          sortOrder: l.sortOrder,
        })),
      },
    },
    include: { lines: true },
  });
}

export async function markInvoicePaid(
  id: number,
  paymentReference?: string,
  paidBy?: string,
) {
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) throw new Error("Factura no encontrada");
  if (inv.status === "VOID") throw new Error("La factura está anulada");
  if (inv.status === "PAID") throw new Error("La factura ya está pagada");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidBy: paidBy?.trim() || "Taller",
        paymentReference: paymentReference?.trim() || null,
        updatedAt: new Date(),
      },
    });
    await tx.workOrder.updateMany({
      where: {
        id: updated.workOrderId,
        status: { in: ["RECEIVED", "IN_PROGRESS"] },
      },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    });
    return updated;
  });
}

export async function voidInvoice(id: number, reason: string, voidedBy?: string) {
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) throw new Error("Factura no encontrada");
  if (inv.status === "VOID") throw new Error("La factura ya está anulada");
  if (inv.status === "PAID") {
    throw new Error("No se puede anular una factura ya pagada");
  }

  return prisma.invoice.update({
    where: { id },
    data: {
      status: "VOID",
      voidedAt: new Date(),
      voidedBy: voidedBy?.trim() || "Taller",
      voidReason: reason.trim(),
      updatedAt: new Date(),
    },
  });
}

export async function getActiveInvoiceForWorkOrder(workOrderId: number) {
  return findActiveInvoiceForWorkOrder(workOrderId);
}

/** Última factura de la orden (incluye anuladas), para volver a consultarla */
function normalizeLinesFromInput(
  lines: UpdateInvoiceInput["lines"],
): InvoiceLineDraft[] {
  return lines.map((l, i) => {
    const quantity = Number(l.quantity) || 1;
    const unitPrice = Number(l.unitPrice) || 0;
    const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
    return {
      lineType: l.lineType,
      sourceType: null,
      sourceId: null,
      description: l.description.trim(),
      quantity,
      unitPrice,
      lineTotal,
      sortOrder: i,
    };
  });
}

function totalsFromLines(
  lines: InvoiceLineDraft[],
  discountAmount: number,
  taxRate: number,
) {
  const laborSubtotal = lines
    .filter((l) => l.lineType === "LABOR")
    .reduce((s, l) => s + l.lineTotal, 0);
  const materialSubtotal = lines
    .filter((l) => l.lineType === "MATERIAL")
    .reduce((s, l) => s + l.lineTotal, 0);
  const partsSubtotal = lines
    .filter((l) => l.lineType === "PART")
    .reduce((s, l) => s + l.lineTotal, 0);
  const otherSubtotal = lines
    .filter((l) => l.lineType === "OTHER")
    .reduce((s, l) => s + l.lineTotal, 0);

  const materialAndParts = materialSubtotal + partsSubtotal + otherSubtotal;

  const totals = computeInvoiceTotals({
    laborSubtotal,
    materialSubtotal: materialAndParts,
    partsSubtotal: 0,
    discountAmount,
    taxRate,
  });

  return {
    laborSubtotal,
    materialSubtotal: materialAndParts,
    partsSubtotal,
    ...totals,
  };
}

export async function updateInvoice(input: UpdateInvoiceInput) {
  const inv = await prisma.invoice.findUnique({ where: { id: input.id } });
  if (!inv) throw new Error("Factura no encontrada");
  if (!canEditInvoice(inv.status)) {
    throw new Error("No se puede editar una factura pagada o anulada");
  }

  const taxRate = invoiceTaxRate(input.billingType);
  const discountAmount = input.discountAmount ?? 0;

  let lines: InvoiceLineDraft[];

  if (input.syncFromWorkOrder) {
    const draft = await buildInvoiceDraftFromWorkOrder(
      inv.workOrderId,
      discountAmount,
      { excludeInvoiceId: inv.id },
    );
    lines = draft.lines;
  } else {
    lines = normalizeLinesFromInput(input.lines);
    if (lines.length === 0) {
      throw new Error("La factura debe tener al menos una línea");
    }
  }

  const totals = totalsFromLines(lines, discountAmount, taxRate);

  const vehicleYear =
    input.vehicleYear == null || Number.isNaN(Number(input.vehicleYear))
      ? null
      : Number(input.vehicleYear);

  let invoiceDate: Date | undefined;
  if (input.invoiceDate?.trim()) {
    const parsed = new Date(input.invoiceDate);
    if (!Number.isNaN(parsed.getTime())) invoiceDate = parsed;
  }

  return prisma.$transaction(async (tx) => {
    await tx.invoiceLine.deleteMany({ where: { invoiceId: inv.id } });

    return tx.invoice.update({
      where: { id: inv.id },
      data: {
        customerName: input.customerName.trim(),
        nationalId: input.nationalId?.trim() || null,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        address: input.address?.trim() || null,
        brand: input.brand?.trim() || null,
        model: input.model?.trim() || null,
        vehicleYear,
        plate: input.plate?.trim() || null,
        vin: input.vin?.trim() || null,
        billingType: input.billingType,
        discountAmount,
        taxRate,
        laborSubtotal: totals.laborSubtotal,
        materialSubtotal: totals.materialSubtotal,
        partsSubtotal: totals.partsSubtotal,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
        notes: input.notes?.trim() || null,
        ...(invoiceDate ? { invoiceDate } : {}),
        updatedAt: new Date(),
        lines: {
          create: lines.map((l) => ({
            lineType: l.lineType,
            sourceType: l.sourceType,
            sourceId: l.sourceId,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.lineTotal,
            sortOrder: l.sortOrder,
          })),
        },
      },
      include: { lines: true },
    });
  });
}

export async function getLatestInvoiceForWorkOrder(workOrderId: number) {
  return prisma.invoice.findFirst({
    where: { workOrderId },
    orderBy: { id: "desc" },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      grandTotal: true,
      invoiceDate: true,
    },
  });
}
