"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  employeeSchema,
  advancePaymentSchema,
  payrollPaySchema,
  payrollAdjustmentSchema,
  type EmployeeInput,
  type AdvancePaymentInput,
  type PayrollPayInput,
  type PayrollAdjustmentInput,
} from "@/lib/validations/employee";
import {
  createEmployee,
  updateEmployee,
  getEmployeeLaborWorkLines,
} from "@/services/employees.service";
import {
  createAdvancePayment,
  generatePayrollSettlements,
  paySettlement,
  updateSettlementAdjustment,
} from "@/services/payroll.service";

export type ActionState =
  | { ok: true; id: number }
  | { ok: false; error: string };

function parseError(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export async function createEmployeeAction(
  input: EmployeeInput,
): Promise<ActionState> {
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const emp = await createEmployee(parsed.data);
    revalidatePath("/employees");
    revalidatePath("/labor-orders");
    return { ok: true, id: emp.Id };
  } catch (e) {
    return { ok: false, error: parseError(e, "Error al crear empleado") };
  }
}

export async function updateEmployeeAction(
  id: number,
  input: EmployeeInput,
): Promise<ActionState> {
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    await updateEmployee(id, parsed.data);
    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    revalidatePath("/labor-orders");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: parseError(e, "Error al actualizar empleado") };
  }
}

export async function getEmployeeLaborWorkLinesAction(employeeId: number) {
  if (!Number.isFinite(employeeId) || employeeId <= 0) {
    return { ok: false as const, error: "Empleado inválido", lines: [] };
  }
  try {
    const lines = await getEmployeeLaborWorkLines(employeeId);
    return { ok: true as const, lines };
  } catch (e) {
    return {
      ok: false as const,
      error: parseError(e, "Error al cargar trabajo del empleado"),
      lines: [],
    };
  }
}

export async function createAdvanceAction(
  input: AdvancePaymentInput,
): Promise<ActionState> {
  const parsed = advancePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const payment = await createAdvancePayment(parsed.data);
    revalidatePath("/payments");
    revalidatePath("/payments/advances");
    revalidatePath(`/employees/${parsed.data.employeeId}`);
    return { ok: true, id: payment.Id };
  } catch (e) {
    return { ok: false, error: parseError(e, "Error al registrar anticipo") };
  }
}

export async function generatePayrollAction(
  periodId: number,
): Promise<ActionState> {
  try {
    await generatePayrollSettlements(periodId);
    revalidatePath("/payments");
    revalidatePath(`/payments/periods/${periodId}`);
    return { ok: true, id: periodId };
  } catch (e) {
    return { ok: false, error: parseError(e, "Error al generar corte") };
  }
}

export async function paySettlementAction(
  input: PayrollPayInput,
): Promise<ActionState> {
  const parsed = payrollPaySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const payment = await paySettlement(parsed.data);
    revalidatePath("/payments");
    revalidatePath(`/payments/periods/${parsed.data.settlementId}`);
    return { ok: true, id: payment?.Id ?? parsed.data.settlementId };
  } catch (e) {
    return { ok: false, error: parseError(e, "Error al registrar pago") };
  }
}

export async function generatePayrollFormAction(periodId: number) {
  const result = await generatePayrollAction(periodId);
  if (!result.ok) throw new Error(result.error);
  redirect(`/payments/periods/${periodId}`);
}

export async function paySettlementFormAction(settlementId: number) {
  const result = await paySettlementAction({
    settlementId,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "EFECTIVO",
    paidBy: "Taller",
  });
  if (!result.ok) throw new Error(result.error);
  if (result.id && result.id !== settlementId) {
    redirect(`/print/payments/${result.id}?auto=1`);
  }
  redirect(`/payments/periods`);
}

export async function adjustSettlementAction(
  input: PayrollAdjustmentInput,
): Promise<ActionState> {
  const parsed = payrollAdjustmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }
  try {
    const s = await updateSettlementAdjustment(parsed.data);
    revalidatePath(`/payments/periods/${s.PayrollPeriodId}`);
    return { ok: true, id: s.Id };
  } catch (e) {
    return { ok: false, error: parseError(e, "Error al ajustar liquidación") };
  }
}
