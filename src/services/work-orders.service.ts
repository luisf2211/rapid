import { prisma } from "@/lib/prisma";
import {
  CHECKLIST_ITEMS,
  CHECKLIST_FIELD_BY_LABEL,
  type ChecklistField,
} from "@/lib/constants";
import type { WorkOrderInput } from "@/lib/validations/work-order";

async function generateOrderNumber(): Promise<number> {
  const max = await prisma.workOrder.aggregate({
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
  const where: Record<string, unknown> = {};
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
  const order = await prisma.workOrder.findUnique({
    where: { id },
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
    },
  });
  return order;
}

/**
 * Converts an array of WorkOrderReceptionChecklist rows into a friendly map
 * keyed by our ChecklistField names.
 */
export function checklistRowsToMap(
  rows: { itemName: string; isChecked: boolean }[] | null | undefined,
): Record<ChecklistField, boolean> {
  const map: Record<string, boolean> = {};
  for (const item of CHECKLIST_ITEMS) map[item.field] = false;
  if (!rows) return map as Record<ChecklistField, boolean>;
  for (const row of rows) {
    const field = CHECKLIST_FIELD_BY_LABEL[row.itemName];
    if (field) map[field] = row.isChecked;
  }
  return map as Record<ChecklistField, boolean>;
}

export async function createWorkOrder(input: WorkOrderInput) {
  const orderNumber = await generateOrderNumber();
  const deliveryDate = new Date(`${input.deliveryDate}T00:00:00.000Z`);
  const deliveryTime = buildTimeDate(input.deliveryTime);

  const checklistRows = CHECKLIST_ITEMS.map((it) => ({
    itemName: it.label,
    isChecked: Boolean(input.checklist[it.field]),
    hasComment: false,
  }));

  return prisma.workOrder.create({
    data: {
      orderNumber,
      status: "RECEIVED",
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
      receptions: {
        create: {
          deliveryDate,
          deliveryTime,
          fuelLevel: input.fuelLevel,
          requestedDamages: input.requestedDamages || null,
          observations: input.observations || null,
          receivedBy: input.receivedBy,
          checklist: {
            create: checklistRows,
          },
        },
      },
      damages: {
        create: input.damages.map((d) => ({
          vehicleSide: d.vehicleSide,
          damageType: d.damageType,
          description: d.description || null,
          positionX: d.positionX ?? null,
          positionY: d.positionY ?? null,
        })),
      },
      photos: {
        create: input.photos.map((p) => ({
          photoUrl: p.photoUrl,
          photoType: p.photoType,
          description: p.description || null,
        })),
      },
    },
  });
}

export async function getDashboardStats() {
  const [
    totalOrders,
    receivedOrders,
    inProgressOrders,
    completedOrders,
    materialAgg,
    laborAgg,
    recentOrders,
  ] = await Promise.all([
    prisma.workOrder.count(),
    prisma.workOrder.count({ where: { status: "RECEIVED" } }),
    prisma.workOrder.count({ where: { status: "IN_PROGRESS" } }),
    prisma.workOrder.count({ where: { status: "COMPLETED" } }),
    prisma.materialRequisition.aggregate({ _sum: { total: true } }),
    prisma.laborOrder.aggregate({ _sum: { total: true } }),
    prisma.workOrder.findMany({
      take: 8,
      orderBy: { id: "desc" },
      include: { receptions: { take: 1, orderBy: { id: "asc" } } },
    }),
  ]);

  return {
    totalOrders,
    receivedOrders,
    inProgressOrders,
    completedOrders,
    totalMaterials: Number(materialAgg._sum.total ?? 0),
    totalLabor: Number(laborAgg._sum.total ?? 0),
    recentOrders,
  };
}

export async function getWorkOrderFinancialSummary(workOrderId: number) {
  const [materialAgg, laborAgg] = await Promise.all([
    prisma.materialRequisition.aggregate({
      where: { workOrderId },
      _sum: { total: true },
    }),
    prisma.laborOrder.aggregate({
      where: { workOrderId },
      _sum: { total: true },
    }),
  ]);

  const totalMaterials = Number(materialAgg._sum.total ?? 0);
  const totalLabor = Number(laborAgg._sum.total ?? 0);

  return {
    totalMaterials,
    totalLabor,
    grandTotal: totalMaterials + totalLabor,
  };
}

export async function updateWorkOrderStatus(id: number, status: string) {
  return prisma.workOrder.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });
}
