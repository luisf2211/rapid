import { toPlainNumber } from "@/lib/serialize";

type EmployeeLike = {
  Name: string;
  Role: string;
  DefaultUnitPrice?: unknown;
};

export function employeeDisplayName(emp: EmployeeLike): string {
  return `${emp.Role} — ${emp.Name}`;
}

export function employeeDefaultUnitPrice(emp: EmployeeLike): number {
  return toPlainNumber(emp.DefaultUnitPrice) ?? 0;
}
