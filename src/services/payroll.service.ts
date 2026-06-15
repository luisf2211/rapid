import { prisma } from "@/lib/prisma";
import { employeeDisplayName } from "@/lib/employee/display";
import {
  mapLaborOrderToWorkLines,
  snapshotAdvanceWorkLine,
} from "@/lib/employee/labor-work";
import {
  computeLaborLineAmount,
  laborItemLineAmount,
  laborItemQuantity,
  laborItemUnitPrice,
} from "@/lib/labor-order/piece-count";
import {
  formatPeriodRange,
  getQuincenaForDate,
  toDateOnly,
} from "@/lib/payroll/period";
import type {
  AdvancePaymentInput,
  PayrollAdjustmentInput,
  PayrollPayInput,
} from "@/lib/validations/employee";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";

async function nextPaymentNumber(): Promise<number> {
  const agg = await prisma.employeePayment.aggregate({
    _max: { PaymentNumber: true },
  });
  return (agg._max.PaymentNumber ?? 0) + 1;
}

export async function listEmployeePayments(params?: {
  type?: "ADVANCE" | "PAYROLL";
  employeeId?: number;
  limit?: number;
}) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.employeePayment.findMany({
    where: {
      Employee: companyWhere(companyId),
      ...(params?.type ? { Type: params.type } : {}),
      ...(params?.employeeId ? { EmployeeId: params.employeeId } : {}),
    },
    include: { Employee: true },
    orderBy: { CreatedAt: "desc" },
    take: params?.limit ?? 50,
  });
}

export async function getEmployeePaymentById(id: number) {
  return prisma.employeePayment.findUnique({
    where: { Id: id },
    include: {
      Employee: true,
      PayrollPeriod: true,
      EmployeePaymentWorkLine: {
        orderBy: { Id: "asc" },
      },
      PayrollSettlement_EmployeePayment_PayrollSettlementIdToPayrollSettlement: {
        include: {
          PayrollLine: true,
          PayrollPeriod: true,
        },
      },
    },
  });
}

async function resolveAdvanceWorkLines(
  employeeId: number,
  laborOrderItemIds: number[],
) {
  if (laborOrderItemIds.length === 0) return [];

  const laborOrders = await prisma.laborOrder.findMany({
    where: {
      EmployeeId: employeeId,
      items: { some: { id: { in: laborOrderItemIds } } },
    },
    include: {
      items: { where: { id: { in: laborOrderItemIds } } },
      workOrder: {
        select: {
          id: true,
          orderNumber: true,
          plate: true,
          customerName: true,
        },
      },
    },
  });

  const foundIds = new Set(
    laborOrders.flatMap((lo) => lo.items.map((i) => i.id)),
  );
  const missing = laborOrderItemIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw new Error("Algunas piezas seleccionadas no pertenecen al empleado.");
  }

  const usedRows = await prisma.employeePaymentWorkLine.findMany({
    where: { LaborOrderItemId: { in: laborOrderItemIds } },
    select: { LaborOrderItemId: true },
  });
  if (usedRows.length > 0) {
    throw new Error("Una o más piezas ya están vinculadas a otro anticipo.");
  }

  return laborOrders.flatMap((lo) =>
    mapLaborOrderToWorkLines(lo, new Set()).map(snapshotAdvanceWorkLine),
  );
}

export async function createAdvancePayment(input: AdvancePaymentInput) {
  const paymentNumber = await nextPaymentNumber();
  const itemIds = input.laborOrderItemIds ?? [];
  const workLines = await resolveAdvanceWorkLines(input.employeeId, itemIds);

  return prisma.$transaction(async (tx) => {
    const payment = await tx.employeePayment.create({
      data: {
        PaymentNumber: paymentNumber,
        EmployeeId: input.employeeId,
        Type: "ADVANCE",
        Amount: Number(input.amount),
        PaymentDate: new Date(input.paymentDate),
        PaymentMethod: input.paymentMethod?.trim() || "EFECTIVO",
        Reference: input.reference?.trim() || null,
        Notes: input.notes?.trim() || null,
        Status: "PAID",
        PaidBy: input.paidBy?.trim() || "Taller",
      },
      include: { Employee: true },
    });

    if (workLines.length > 0) {
      await tx.employeePaymentWorkLine.createMany({
        data: workLines.map((line) => ({
          EmployeePaymentId: payment.Id,
          ...line,
        })),
      });
    }

    return payment;
  });
}

export async function listPayrollPeriods() {
  const companyId = await requireCompanyIdFromSession();
  return prisma.payrollPeriod.findMany({
    where: companyWhere(companyId),
    orderBy: { PeriodStart: "desc" },
    include: {
      _count: { select: { PayrollSettlement: true } },
    },
  });
}

export async function getPayrollPeriodById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.payrollPeriod.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
    include: {
      PayrollSettlement: {
        include: {
          Employee: true,
          PayrollLine: true,
          EmployeePayment_EmployeePayment_PayrollSettlementIdToPayrollSettlement: true,
        },
        orderBy: { Employee: { Name: "asc" } },
      },
    },
  });
}

export async function getOrCreateCurrentPayrollPeriod() {
  const companyId = await requireCompanyIdFromSession();
  const { periodStart, periodEnd } = getQuincenaForDate();
  const start = toDateOnly(periodStart);
  const end = toDateOnly(periodEnd);

  const existing = await prisma.payrollPeriod.findFirst({
    where: { PeriodStart: start, PeriodEnd: end, ...companyWhere(companyId) },
  });
  if (existing) return existing;

  return prisma.payrollPeriod.create({
    data: {
      PeriodStart: start,
      PeriodEnd: end,
      Status: "OPEN",
      ...companyWhere(companyId),
    },
  });
}

/** Genera liquidaciones desde MO del período (no incluidas en otro corte). */
export async function generatePayrollSettlements(periodId: number) {
  const period = await prisma.payrollPeriod.findUnique({
    where: { Id: periodId },
  });
  if (!period) throw new Error("Período no encontrado");
  if (period.Status === "PAID") {
    throw new Error("Este período ya fue pagado");
  }

  const start = period.PeriodStart;
  const end = period.PeriodEnd;

  const laborOrders = await prisma.laborOrder.findMany({
    where: {
      EmployeeId: { not: null },
      createdAt: {
        gte: start,
        lte: new Date(end.getTime() + 86400000 - 1),
      },
    },
    include: {
      items: true,
      workOrder: true,
    },
  });

  const usedItemIds = new Set(
    (
      await prisma.payrollLine.findMany({
        where: { SourceType: "LABOR_ORDER", LaborOrderItemId: { not: null } },
        select: { LaborOrderItemId: true },
      })
    )
      .map((l) => l.LaborOrderItemId)
      .filter((id): id is number => id != null),
  );

  const byEmployee = new Map<
    number,
    {
      employeeId: number;
      lines: {
        laborOrderId: number;
        laborOrderItemId: number;
        workOrderId: number;
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
      }[];
    }
  >();

  for (const lo of laborOrders) {
    if (!lo.EmployeeId) continue;
    for (const it of lo.items) {
      if (usedItemIds.has(it.id)) continue;
      const qty = laborItemQuantity(it);
      const unitPrice = laborItemUnitPrice(it);
      const amount = laborItemLineAmount(it);
      if (amount <= 0 && qty <= 0) continue;

      const bucket = byEmployee.get(lo.EmployeeId) ?? {
        employeeId: lo.EmployeeId,
        lines: [],
      };
      bucket.lines.push({
        laborOrderId: lo.id,
        laborOrderItemId: it.id,
        workOrderId: lo.workOrderId,
        description: `${it.partName} · ORD-${String(lo.workOrder.orderNumber).padStart(5, "0")}`,
        quantity: qty,
        unitPrice,
        amount,
      });
      byEmployee.set(lo.EmployeeId, bucket);
    }
  }

  if (byEmployee.size === 0) {
    throw new Error(
      "No hay mano de obra con empleado asignado en este período.",
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.payrollSettlement.deleteMany({
      where: {
        PayrollPeriodId: periodId,
        Status: "PENDING",
      },
    });

    const settlements = [];

    for (const bucket of byEmployee.values()) {
      const gross = bucket.lines.reduce((s, l) => s + l.amount, 0);
      const advances = await tx.employeePayment.findMany({
        where: {
          EmployeeId: bucket.employeeId,
          Type: "ADVANCE",
          Status: "PAID",
          DeductedInSettlementId: null,
          PaymentDate: { lte: end },
        },
      });
      const advancesAmount = advances.reduce(
        (s, a) => s + Number(a.Amount),
        0,
      );
      const net = Math.round((gross - advancesAmount) * 100) / 100;

      const settlement = await tx.payrollSettlement.create({
        data: {
          PayrollPeriodId: periodId,
          EmployeeId: bucket.employeeId,
          GrossAmount: gross,
          AdvancesAmount: advancesAmount,
          AdjustmentsAmount: 0,
          NetAmount: net,
          Status: "PENDING",
          PayrollLine: {
            create: bucket.lines.map((l) => ({
              SourceType: "LABOR_ORDER",
              LaborOrderId: l.laborOrderId,
              LaborOrderItemId: l.laborOrderItemId,
              WorkOrderId: l.workOrderId,
              Description: l.description,
              Quantity: l.quantity,
              UnitPrice: l.unitPrice,
              Amount: l.amount,
            })),
          },
        },
        include: { Employee: true, PayrollLine: true },
      });

      settlements.push(settlement);
    }

    await tx.payrollPeriod.update({
      where: { Id: periodId },
      data: { Status: "CLOSED", ClosedAt: new Date() },
    });

    return settlements;
  });
}

export async function updateSettlementAdjustment(
  input: PayrollAdjustmentInput,
) {
  const settlement = await prisma.payrollSettlement.findUnique({
    where: { Id: input.settlementId },
  });
  if (!settlement) throw new Error("Liquidación no encontrada");
  if (settlement.Status === "PAID") {
    throw new Error("La liquidación ya fue pagada");
  }

  const adj = Number(input.adjustmentsAmount);
  const gross = Number(settlement.GrossAmount);
  const advances = Number(settlement.AdvancesAmount);
  const net = Math.round((gross - advances + adj) * 100) / 100;

  return prisma.payrollSettlement.update({
    where: { Id: input.settlementId },
    data: {
      AdjustmentsAmount: adj,
      NetAmount: net,
    },
  });
}

export async function paySettlement(input: PayrollPayInput) {
  const settlement = await prisma.payrollSettlement.findUnique({
    where: { Id: input.settlementId },
    include: { PayrollPeriod: true, Employee: true },
  });
  if (!settlement) throw new Error("Liquidación no encontrada");
  if (settlement.Status === "PAID") {
    throw new Error("Esta liquidación ya fue pagada");
  }

  const net = Number(settlement.NetAmount);
  if (net < 0) {
    throw new Error("El neto a pagar no puede ser negativo");
  }

  const paymentNumber = await nextPaymentNumber();

  return prisma.$transaction(async (tx) => {
    const payment =
      net > 0
        ? await tx.employeePayment.create({
            data: {
              PaymentNumber: paymentNumber,
              EmployeeId: settlement.EmployeeId,
              Type: "PAYROLL",
              Amount: net,
              PaymentDate: new Date(input.paymentDate),
              PaymentMethod: input.paymentMethod?.trim() || "EFECTIVO",
              Reference: input.reference?.trim() || null,
              Status: "PAID",
              PaidBy: input.paidBy?.trim() || "Taller",
              PayrollPeriodId: settlement.PayrollPeriodId,
              PayrollSettlementId: settlement.Id,
            },
          })
        : null;

    await tx.employeePayment.updateMany({
      where: {
        EmployeeId: settlement.EmployeeId,
        Type: "ADVANCE",
        Status: "PAID",
        DeductedInSettlementId: null,
        PaymentDate: { lte: settlement.PayrollPeriod.PeriodEnd },
      },
      data: { DeductedInSettlementId: settlement.Id },
    });

    await tx.payrollSettlement.update({
      where: { Id: settlement.Id },
      data: { Status: "PAID" },
    });

    const pending = await tx.payrollSettlement.count({
      where: {
        PayrollPeriodId: settlement.PayrollPeriodId,
        Status: "PENDING",
        Id: { not: settlement.Id },
      },
    });

    if (pending === 0) {
      await tx.payrollPeriod.update({
        where: { Id: settlement.PayrollPeriodId },
        data: { Status: "PAID", PaidAt: new Date() },
      });
    }

    return payment;
  });
}

export function payrollPeriodLabel(period: {
  PeriodStart: Date;
  PeriodEnd: Date;
}): string {
  return formatPeriodRange(period.PeriodStart, period.PeriodEnd);
}

export { employeeDisplayName, computeLaborLineAmount };

export async function getPayrollSettlementById(id: number) {
  return prisma.payrollSettlement.findUnique({
    where: { Id: id },
    include: {
      Employee: true,
      PayrollLine: true,
      PayrollPeriod: true,
    },
  });
}
