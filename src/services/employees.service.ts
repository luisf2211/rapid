import { prisma } from "@/lib/prisma";
import type { EmployeeInput } from "@/lib/validations/employee";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { toPlainNumber } from "@/lib/serialize";
import {
  mapLaborOrderToWorkLines,
  type EmployeeLaborWorkLine,
} from "@/lib/employee/labor-work";

function mapEmployeeInput(input: EmployeeInput) {
  return {
    Name: input.name.trim(),
    Role: input.role,
    Phone: input.phone?.trim() || null,
    NationalId: input.nationalId?.trim() || null,
    DefaultUnitPrice: Number(input.defaultUnitPrice),
    IsExternal: input.isExternal,
    IsActive: input.isActive,
    HiredAt: input.hiredAt ? new Date(input.hiredAt) : null,
    Notes: input.notes?.trim() || null,
  };
}

export async function listEmployees(params?: {
  search?: string;
  activeOnly?: boolean;
}) {
  const companyId = await requireCompanyIdFromSession();
  const search = params?.search?.trim();
  return prisma.employee.findMany({
    where: {
      ...companyWhere(companyId),
      ...(params?.activeOnly ? { IsActive: true } : {}),
      ...(search
        ? {
            OR: [
              { Name: { contains: search } },
              { Role: { contains: search } },
              { Phone: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ IsActive: "desc" }, { Name: "asc" }],
  });
}

export type EmployeePickerRow = {
  Id: number;
  Name: string;
  Role: string;
  DefaultUnitPrice: number;
};

export async function listActiveEmployeesForPicker(): Promise<EmployeePickerRow[]> {
  const companyId = await requireCompanyIdFromSession();
  const rows = await prisma.employee.findMany({
    where: { ...companyWhere(companyId), IsActive: true },
    orderBy: { Name: "asc" },
    select: {
      Id: true,
      Name: true,
      Role: true,
      DefaultUnitPrice: true,
    },
  });

  return rows.map((e) => ({
    Id: e.Id,
    Name: e.Name,
    Role: e.Role,
    DefaultUnitPrice: toPlainNumber(e.DefaultUnitPrice) ?? 0,
  }));
}

export async function getEmployeeById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.employee.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
    include: {
      LaborOrder: {
        take: 25,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          workOrder: {
            select: {
              id: true,
              orderNumber: true,
              plate: true,
              customerName: true,
              brand: true,
              model: true,
            },
          },
        },
      },
      EmployeePayment: {
        take: 15,
        orderBy: { CreatedAt: "desc" },
      },
    },
  });
}

export async function getEmployeeLaborWorkLines(
  employeeId: number,
  limit = 50,
): Promise<EmployeeLaborWorkLine[]> {
  const laborOrders = await prisma.laborOrder.findMany({
    where: { EmployeeId: employeeId },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: {
      items: true,
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

  const itemIds = laborOrders.flatMap((lo) => lo.items.map((i) => i.id));
  const usedRows =
    itemIds.length > 0
      ? await prisma.employeePaymentWorkLine.findMany({
          where: { LaborOrderItemId: { in: itemIds } },
          select: { LaborOrderItemId: true },
        })
      : [];
  const usedItemIds = new Set(usedRows.map((r) => r.LaborOrderItemId));

  const lines = laborOrders.flatMap((lo) =>
    mapLaborOrderToWorkLines(lo, usedItemIds),
  );

  return lines.slice(0, limit);
}

export async function getEmployeeStats() {
  const companyId = await requireCompanyIdFromSession();
  const where = companyWhere(companyId);
  const [total, active] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.count({ where: { ...where, IsActive: true } }),
  ]);
  return { total, active };
}

export function employeeToFormValues(emp: {
  Name: string;
  Role: string;
  Phone: string | null;
  NationalId: string | null;
  DefaultUnitPrice: unknown;
  IsExternal: boolean;
  IsActive: boolean;
  HiredAt: Date | null;
  Notes: string | null;
}) {
  return {
    name: emp.Name,
    role: emp.Role as EmployeeInput["role"],
    phone: emp.Phone ?? "",
    nationalId: emp.NationalId ?? "",
    defaultUnitPrice: toPlainNumber(emp.DefaultUnitPrice) ?? 0,
    isExternal: emp.IsExternal,
    isActive: emp.IsActive,
    hiredAt: emp.HiredAt
      ? emp.HiredAt.toISOString().slice(0, 10)
      : "",
    notes: emp.Notes ?? "",
  };
}

export async function createEmployee(input: EmployeeInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.employee.create({
    data: { ...mapEmployeeInput(input), ...companyWhere(companyId) },
  });
}

export async function updateEmployee(id: number, input: EmployeeInput) {
  const companyId = await requireCompanyIdFromSession();
  const existing = await prisma.employee.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
  });
  if (!existing) throw new Error("Empleado no encontrado");
  return prisma.employee.update({
    where: { Id: id },
    data: mapEmployeeInput(input),
  });
}

export async function getEmployeePendingAdvances(employeeId: number) {
  const advances = await prisma.employeePayment.findMany({
    where: {
      EmployeeId: employeeId,
      Type: "ADVANCE",
      Status: "PAID",
      DeductedInSettlementId: null,
    },
    orderBy: { PaymentDate: "asc" },
  });
  return advances.reduce(
    (acc, p) => acc + Number(p.Amount),
    0,
  );
}
