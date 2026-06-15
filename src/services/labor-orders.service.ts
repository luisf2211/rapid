import type { Employee, LaborOrder, LaborOrderItem, WorkOrder } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { employeeDisplayName } from "@/lib/employee/display";
import {
  computeLaborLineAmount,
  sumLaborOrderAmount,
} from "@/lib/labor-order/piece-count";
import type { LaborOrderInput } from "@/lib/validations/labor-order";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";

export type LaborOrderWithRelations = LaborOrder & {
  workOrder: WorkOrder;
  items: LaborOrderItem[];
  Employee: Employee | null;
};

const laborOrderInclude = {
  workOrder: true,
  items: true,
} as const;

type LaborOrderRow = LaborOrder & {
  workOrder: WorkOrder;
  items: LaborOrderItem[];
};

async function attachEmployees(
  rows: LaborOrderRow[],
): Promise<LaborOrderWithRelations[]> {
  const employeeIds = [
    ...new Set(
      rows
        .map((r) => r.EmployeeId)
        .filter((id): id is number => id != null),
    ),
  ];

  const employees =
    employeeIds.length > 0
      ? await prisma.employee.findMany({
          where: { Id: { in: employeeIds } },
        })
      : [];

  const byId = new Map(employees.map((e) => [e.Id, e]));

  return rows.map((row) => ({
    ...row,
    Employee: row.EmployeeId ? byId.get(row.EmployeeId) ?? null : null,
  }));
}

async function attachEmployee(
  row: LaborOrderRow | null,
): Promise<LaborOrderWithRelations | null> {
  if (!row) return null;
  const [withEmp] = await attachEmployees([row]);
  return withEmp;
}

export async function listLaborOrders(params?: { workOrderId?: number }) {
  const companyId = await requireCompanyIdFromSession();
  const rows = await prisma.laborOrder.findMany({
    where: {
      workOrder: companyWhere(companyId),
      ...(params?.workOrderId ? { workOrderId: params.workOrderId } : {}),
    },
    include: laborOrderInclude,
    orderBy: { id: "desc" },
  });
  return attachEmployees(rows);
}

export async function getLaborOrderById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  const row = await prisma.laborOrder.findFirst({
    where: { id, workOrder: companyWhere(companyId) },
    include: laborOrderInclude,
  });
  return attachEmployee(row);
}

function mapItems(input: LaborOrderInput) {
  return input.items.map((it) => {
    const quantity = Number(it.quantity);
    const unitPrice = Number(it.unitPrice);
    const lineTotal = computeLaborLineAmount(quantity, unitPrice);
    return {
      partName: it.partName.trim(),
      quantity,
      unitPrice,
      total: lineTotal,
    };
  });
}

async function resolveTechnicianLabel(employeeId: number) {
  const companyId = await requireCompanyIdFromSession();
  const emp = await prisma.employee.findFirst({
    where: { Id: employeeId, ...companyWhere(companyId) },
  });
  if (!emp) throw new Error("Empleado no encontrado");
  return employeeDisplayName(emp);
}

async function assertWorkOrderInCompany(workOrderId: number, companyId: number) {
  const wo = await prisma.workOrder.findFirst({
    where: { id: workOrderId, ...companyWhere(companyId) },
  });
  if (!wo) throw new Error("Orden no encontrada en tu empresa");
  return wo;
}

export async function createLaborOrder(input: LaborOrderInput) {
  const companyId = await requireCompanyIdFromSession();
  await assertWorkOrderInCompany(input.workOrderId, companyId);
  const items = mapItems(input);
  const total = sumLaborOrderAmount(items);
  const technician = await resolveTechnicianLabel(input.employeeId);

  const row = await prisma.laborOrder.create({
    data: {
      workOrderId: input.workOrderId,
      EmployeeId: input.employeeId,
      technician,
      Status: "PENDING",
      total,
      items: {
        create: items,
      },
    },
    include: laborOrderInclude,
  });

  return attachEmployee(row);
}

export async function updateLaborOrder(id: number, input: LaborOrderInput) {
  const companyId = await requireCompanyIdFromSession();
  const existing = await prisma.laborOrder.findFirst({
    where: { id, workOrder: companyWhere(companyId) },
  });
  if (!existing) throw new Error("Orden de mano de obra no encontrada");
  await assertWorkOrderInCompany(input.workOrderId, companyId);
  const items = mapItems(input);
  const total = sumLaborOrderAmount(items);
  const technician = await resolveTechnicianLabel(input.employeeId);

  const row = await prisma.$transaction(async (tx) => {
    await tx.laborOrderItem.deleteMany({ where: { laborOrderId: id } });
    return tx.laborOrder.update({
      where: { id },
      data: {
        workOrderId: input.workOrderId,
        EmployeeId: input.employeeId,
        technician,
        total,
        items: { create: items },
      },
      include: laborOrderInclude,
    });
  });

  return attachEmployee(row);
}
