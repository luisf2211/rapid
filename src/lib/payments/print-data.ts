import { formatDate } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import { employeeDisplayName } from "@/lib/employee/display";
import { payrollPeriodLabel } from "@/services/payroll.service";
import { EMPLOYEE_PAYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatPieceCount } from "@/lib/labor-order/piece-count";

type PaymentWithRelations = {
  Id: number;
  PaymentNumber: number;
  Type: string;
  Amount: unknown;
  PaymentDate: Date;
  PaymentMethod: string | null;
  Reference: string | null;
  Notes: string | null;
  PaidBy: string | null;
  Employee: { Name: string; Role: string; NationalId: string | null };
  EmployeePaymentWorkLine?: {
    Description: string;
    Quantity: unknown;
    UnitPrice: unknown;
    Amount: unknown;
  }[];
  PayrollSettlement_EmployeePayment_PayrollSettlementIdToPayrollSettlement?: {
    GrossAmount: unknown;
    AdvancesAmount: unknown;
    AdjustmentsAmount: unknown;
    NetAmount: unknown;
    PayrollLine: {
      Description: string;
      Quantity: unknown;
      UnitPrice: unknown;
      Amount: unknown;
    }[];
    PayrollPeriod: { PeriodStart: Date; PeriodEnd: Date };
  } | null;
};

export type EmployeePaymentPrintData = {
  docTitle: string;
  docNumber: string;
  paymentType: string;
  paymentDate: string;
  employeeName: string;
  employeeRole: string;
  nationalId: string;
  amount: string;
  paymentMethod: string;
  reference: string;
  notes: string;
  paidBy: string;
  periodLabel?: string;
  workSectionTitle?: string;
  lines?: {
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
  }[];
  gross?: string;
  advances?: string;
  adjustments?: string;
  net?: string;
};

export function buildEmployeePaymentPrintData(
  payment: PaymentWithRelations,
): EmployeePaymentPrintData {
  const settlement =
    payment.PayrollSettlement_EmployeePayment_PayrollSettlementIdToPayrollSettlement;

  const prefix = payment.Type === "ADVANCE" ? "ANT" : "PAG";
  const base: EmployeePaymentPrintData = {
    docTitle:
      payment.Type === "ADVANCE"
        ? "COMPROBANTE DE ANTICIPO"
        : "COMPROBANTE DE PAGO QUINCENAL",
    docNumber: `${prefix}-${String(payment.PaymentNumber).padStart(5, "0")}`,
    paymentType: EMPLOYEE_PAYMENT_TYPE_LABELS[payment.Type] ?? payment.Type,
    paymentDate: formatDate(payment.PaymentDate),
    employeeName: payment.Employee.Name,
    employeeRole: payment.Employee.Role,
    nationalId: payment.Employee.NationalId ?? "—",
    amount: formatMoney(Number(payment.Amount)),
    paymentMethod: payment.PaymentMethod ?? "EFECTIVO",
    reference: payment.Reference ?? "—",
    notes: payment.Notes ?? "",
    paidBy: payment.PaidBy ?? "Taller",
  };

  if (settlement && payment.Type === "PAYROLL") {
    return {
      ...base,
      periodLabel: payrollPeriodLabel(settlement.PayrollPeriod),
      gross: formatMoney(Number(settlement.GrossAmount)),
      advances: formatMoney(Number(settlement.AdvancesAmount)),
      adjustments: formatMoney(Number(settlement.AdjustmentsAmount)),
      net: formatMoney(Number(settlement.NetAmount)),
      lines: settlement.PayrollLine.map((l) => ({
        description: l.Description,
        quantity: formatPieceCount(Number(l.Quantity)),
        unitPrice: formatMoney(Number(l.UnitPrice)),
        amount: formatMoney(Number(l.Amount)),
      })),
    };
  }

  const workLines = payment.EmployeePaymentWorkLine ?? [];
  if (payment.Type === "ADVANCE" && workLines.length > 0) {
    return {
      ...base,
      workSectionTitle: "Trabajo incluido en este anticipo",
      lines: workLines.map((l) => ({
        description: l.Description,
        quantity: formatPieceCount(Number(l.Quantity)),
        unitPrice: formatMoney(Number(l.UnitPrice)),
        amount: formatMoney(Number(l.Amount)),
      })),
    };
  }

  return base;
}

export function buildSettlementPrintData(settlement: {
  Employee: { Name: string; Role: string; NationalId: string | null };
  GrossAmount: unknown;
  AdvancesAmount: unknown;
  AdjustmentsAmount: unknown;
  NetAmount: unknown;
  PayrollPeriod: { PeriodStart: Date; PeriodEnd: Date };
  PayrollLine: {
    Description: string;
    Quantity: unknown;
    UnitPrice: unknown;
    Amount: unknown;
  }[];
}) {
  return {
    docTitle: "LIQUIDACIÓN QUINCENAL",
    employeeName: employeeDisplayName(settlement.Employee),
    nationalId: settlement.Employee.NationalId ?? "—",
    periodLabel: payrollPeriodLabel(settlement.PayrollPeriod),
    gross: formatMoney(Number(settlement.GrossAmount)),
    advances: formatMoney(Number(settlement.AdvancesAmount)),
    adjustments: formatMoney(Number(settlement.AdjustmentsAmount)),
    net: formatMoney(Number(settlement.NetAmount)),
    lines: settlement.PayrollLine.map((l) => ({
      description: l.Description,
      quantity: formatPieceCount(Number(l.Quantity)),
      unitPrice: formatMoney(Number(l.UnitPrice)),
      amount: formatMoney(Number(l.Amount)),
    })),
  };
}
