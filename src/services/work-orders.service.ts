import { CHECKLIST_ITEMS, WORK_ORDER_STATUS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { sumLaborOrderAmount, sumLaborOrderPieces } from "@/lib/labor-order/piece-count";

/** Estados que pasan a COMPLETED cuando la factura queda pagada. */
const WORK_ORDER_STATUSES_COMPLETE_ON_PAID = [
  WORK_ORDER_STATUS.RECEIVED,
  WORK_ORDER_STATUS.IN_PROGRESS,
] as const;
import { checklistFieldToDbItemName } from "@/lib/checklist";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import type { WorkOrderInput } from "@/lib/validations/work-order";

async function generateOrderNumber(companyId: number): Promise<number> {
  const max = await prisma.workOrder.aggregate({
    where: companyWhere(companyId),
    _max: { orderNumber: true },
  });
  return (max._max.orderNumber ?? 0) + 1;
}

function buildTimeDate(hhmm: string): Date {
  // SQL Server TIME type → Date with the time set on epoch
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10) || 0);
  const d = new Date("1970-01-01T00:00:00.000Z");
  d.setUTCHours(h, m, 0, 0);
  return d;
}

export async function listWorkOrders(params?: {
  search?: string;
  status?: string;
  take?: number;
}) {
  const companyId = await requireCompanyIdFromSession();
  const where: Record<string, unknown> = { ...companyWhere(companyId) };
  if (params?.status) where.status = params.status;
  if (params?.search) {
    const s = params.search;
    const asNumber = Number(s);
    const or: Record<string, unknown>[] = [
      { customerName: { contains: s } },
      { plate: { contains: s } },
      { brand: { contains: s } },
      { model: { contains: s } },
    ];
    if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
      or.push({ orderNumber: asNumber });
    }
    where.OR = or;
  }
  return prisma.workOrder.findMany({
    where,
    take: params?.take,
    orderBy: { id: "desc" },
    include: {
      receptions: { take: 1, orderBy: { id: "asc" } },
      _count: {
        select: {
          materialRequisitions: true,
          laborOrders: true,
          damages: true,
          photos: true,
        },
      },
    },
  });
}

export async function getWorkOrderById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  const order = await prisma.workOrder.findFirst({
    where: { id, ...companyWhere(companyId) },
    include: {
      receptions: {
        orderBy: { id: "asc" },
        include: { checklist: true },
      },
      damages: { orderBy: { id: "asc" } },
      photos: { orderBy: { id: "asc" } },
      materialRequisitions: {
        include: { items: true },
        orderBy: { id: "desc" },
      },
      laborOrders: {
        include: { items: true },
        orderBy: { id: "desc" },
      },
      quotation: {
        select: {
          id: true,
          quotationNumber: true,
          quotationType: true,
          status: true,
        },
      },
      convertedFrom: {
        take: 1,
        orderBy: { id: "desc" },
        select: {
          id: true,
          quotationNumber: true,
          quotationType: true,
          status: true,
        },
      },
    },
  });
  return order;
}

/** Orden con datos necesarios para imprimir la hoja de recepción */
export async function getWorkOrderForReceptionPrint(id: number) {
  return prisma.workOrder.findUnique({
    where: { id },
    include: {
      receptions: {
        orderBy: { id: "asc" },
        include: { checklist: true },
      },
      damages: { orderBy: { id: "asc" } },
      photos: { orderBy: { id: "asc" } },
      quotation: {
        select: { quotationNumber: true, quotationType: true },
      },
    },
  });
}

function buildChecklistRows(input: WorkOrderInput) {
  return CHECKLIST_ITEMS.map((it) => {
    const entry = input.checklist[it.field];
    const comment = entry?.comment?.trim() ?? "";
    return {
      itemName: checklistFieldToDbItemName(it.field),
      isChecked: Boolean(entry?.checked),
      comments: comment || null,
      hasComment: comment.length > 0,
    };
  });
}

function mapDamages(input: WorkOrderInput) {
  return input.damages.map((d) => ({
    vehicleSide: d.vehicleSide,
    damageType: d.damageType,
    description: d.description || null,
    positionX: d.positionX ?? null,
    positionY: d.positionY ?? null,
  }));
}

function mapPhotos(input: WorkOrderInput) {
  return input.photos.map((p) => ({
    photoUrl: p.photoUrl,
    photoType: p.photoType,
    description: p.description || null,
  }));
}

function workOrderCoreData(input: WorkOrderInput) {
  return {
    customerName: input.customerName,
    phone: input.phone || null,
    email: input.email || null,
    address: input.address || null,
    brand: input.brand,
    model: input.model,
    vehicleYear: input.vehicleYear,
    color: input.color,
    plate: input.plate,
    mileage: input.mileage || null,
    engine: input.engine || null,
    notes: input.notes || null,
    updatedAt: new Date(),
  };
}

function receptionData(input: WorkOrderInput) {
  const deliveryDate = new Date(`${input.deliveryDate}T00:00:00.000Z`);
  const deliveryTime = buildTimeDate(input.deliveryTime);
  const exitDate = input.exitDate
    ? new Date(`${input.exitDate}T00:00:00.000Z`)
    : null;
  const exitTime = input.exitTime ? buildTimeDate(input.exitTime) : null;
  const checklistRows = buildChecklistRows(input);
  return {
    deliveryDate,
    deliveryTime,
    exitDate,
    exitTime,
    fuelLevel: input.fuelLevel,
    requestedDamages: input.requestedDamages || null,
    observations: input.observations || null,
    receivedBy: input.receivedBy,
    customerReceivedSignature: input.customerReceivedSignature?.trim() || null,
    checklistRows,
  };
}

export async function createWorkOrder(input: WorkOrderInput) {
  const companyId = await requireCompanyIdFromSession();
  const orderNumber = await generateOrderNumber(companyId);
  const { checklistRows, ...recv } = receptionData(input);

  return prisma.workOrder.create({
    data: {
      orderNumber,
      CompanyId: companyId,
      status: "RECEIVED",
      ...workOrderCoreData(input),
      receptions: {
        create: {
          ...recv,
          checklist: { create: checklistRows },
        },
      },
      damages: { create: mapDamages(input) },
      photos: { create: mapPhotos(input) },
    },
  });
}

export async function updateWorkOrder(id: number, input: WorkOrderInput) {
  const companyId = await requireCompanyIdFromSession();
  const order = await prisma.workOrder.findFirst({
    where: { id, ...companyWhere(companyId) },
    include: {
      receptions: { orderBy: { id: "asc" }, take: 1 },
    },
  });
  if (!order) throw new Error("Orden no encontrada");

  const { checklistRows, ...recv } = receptionData(input);
  const reception = order.receptions[0];

  return prisma.$transaction(async (tx) => {
    await tx.workOrderDamage.deleteMany({ where: { workOrderId: id } });
    await tx.workOrderPhoto.deleteMany({ where: { workOrderId: id } });

    if (reception) {
      await tx.workOrderReceptionChecklist.deleteMany({
        where: { workOrderReceptionId: reception.id },
      });
    }

    return tx.workOrder.update({
      where: { id },
      data: {
        ...workOrderCoreData(input),
        damages: { create: mapDamages(input) },
        photos: { create: mapPhotos(input) },
        receptions: reception
          ? {
              update: {
                where: { id: reception.id },
                data: {
                  ...recv,
                  checklist: { create: checklistRows },
                },
              },
            }
          : {
              create: {
                ...recv,
                checklist: { create: checklistRows },
              },
            },
      },
    });
  });
}

export async function getDashboardStats() {
  const companyId = await requireCompanyIdFromSession();
  const woWhere = companyWhere(companyId);
  const [
    totalOrders,
    receivedOrders,
    inProgressOrders,
    completedOrders,
    deliveredOrders,
    materialAgg,
    laborPiecesAgg,
    laborAmountAgg,
    recentOrders,
  ] = await Promise.all([
    prisma.workOrder.count({ where: woWhere }),
    prisma.workOrder.count({ where: { ...woWhere, status: "RECEIVED" } }),
    prisma.workOrder.count({ where: { ...woWhere, status: "IN_PROGRESS" } }),
    prisma.workOrder.count({ where: { ...woWhere, status: "COMPLETED" } }),
    prisma.workOrder.count({ where: { ...woWhere, status: "DELIVERED" } }),
    prisma.materialRequisition.aggregate({
      where: { workOrder: woWhere },
      _sum: { total: true },
    }),
    prisma.laborOrderItem.aggregate({
      where: { laborOrder: { workOrder: woWhere } },
      _sum: { quantity: true },
    }),
    prisma.laborOrder.aggregate({
      where: { workOrder: woWhere },
      _sum: { total: true },
    }),
    prisma.workOrder.findMany({
      where: woWhere,
      take: 8,
      orderBy: { id: "desc" },
      include: { receptions: { take: 1, orderBy: { id: "asc" } } },
    }),
  ]);

  const activeInShop = receivedOrders + inProgressOrders;

  return {
    totalOrders,
    receivedOrders,
    inProgressOrders,
    completedOrders,
    deliveredOrders,
    activeInShop,
    totalMaterials: Number(materialAgg._sum.total ?? 0),
    totalLaborPieces: Number(laborPiecesAgg._sum.quantity ?? 0),
    totalLaborAmount: Number(laborAmountAgg._sum.total ?? 0),
    /** @deprecated use totalLaborAmount */
    totalLabor: Number(laborAmountAgg._sum.total ?? 0),
    recentOrders,
  };
}

export async function getWorkOrderFinancialSummary(workOrderId: number) {
  const companyId = await requireCompanyIdFromSession();
  const workOrder = await prisma.workOrder.findFirst({
    where: { id: workOrderId, ...companyWhere(companyId) },
  });
  if (!workOrder) throw new Error("Orden no encontrada");

  const [requisitions, laborOrders] = await Promise.all([
    prisma.materialRequisition.findMany({
      where: { workOrderId },
      include: { items: true },
    }),
    prisma.laborOrder.findMany({
      where: { workOrderId },
      include: { items: true },
    }),
  ]);

  let totalMaterials = 0;
  let totalPaint = 0;
  for (const req of requisitions) {
    for (const item of req.items) {
      const amount = Number(item.total ?? 0);
      if (item.LineType === "PAINT") {
        totalPaint += amount;
      } else {
        totalMaterials += amount;
      }
    }
  }

  const totalLaborPieces = laborOrders.reduce(
    (acc, lo) => acc + sumLaborOrderPieces(lo.items),
    0,
  );
  const totalLaborAmount = laborOrders.reduce(
    (acc, lo) => acc + sumLaborOrderAmount(lo.items),
    0,
  );

  return {
    totalMaterials,
    totalPaint,
    totalLaborPieces,
    totalLaborAmount,
    /** @deprecated use totalLaborAmount */
    totalLabor: totalLaborAmount,
    grandTotal: totalMaterials + totalPaint + totalLaborAmount,
  };
}

export async function updateWorkOrderStatus(id: number, status: string) {
  return prisma.workOrder.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });
}

/** Al pagar la factura, la orden de recepción queda completada (si aún no lo estaba). */
export async function completeWorkOrderOnInvoicePaid(workOrderId: number) {
  await prisma.workOrder.updateMany({
    where: {
      id: workOrderId,
      status: { in: [...WORK_ORDER_STATUSES_COMPLETE_ON_PAID] },
    },
    data: {
      status: WORK_ORDER_STATUS.COMPLETED,
      updatedAt: new Date(),
    },
  });
}

/** Alinea órdenes con factura PAID que siguen en Recibida / En proceso. */
export async function syncWorkOrdersWithPaidInvoices() {
  const paid = await prisma.invoice.findMany({
    where: { status: "PAID" },
    select: { workOrderId: true },
    distinct: ["workOrderId"],
  });
  const workOrderIds = paid.map((p) => p.workOrderId);
  if (workOrderIds.length === 0) return { updated: 0 };

  const result = await prisma.workOrder.updateMany({
    where: {
      id: { in: workOrderIds },
      status: { in: [...WORK_ORDER_STATUSES_COMPLETE_ON_PAID] },
    },
    data: {
      status: WORK_ORDER_STATUS.COMPLETED,
      updatedAt: new Date(),
    },
  });
  return { updated: result.count };
}
