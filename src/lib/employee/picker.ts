import type { EmployeePickerRow } from "@/services/employees.service";

export function mapEmployeesForPicker(employees: EmployeePickerRow[]) {
  return employees.map((e) => ({
    id: e.Id,
    name: e.Name,
    role: e.Role,
    defaultUnitPrice: e.DefaultUnitPrice,
  }));
}

/** Solo campos necesarios para selects (evita pasar Decimal/Date al cliente). */
export function mapEmployeesForSelect(employees: EmployeePickerRow[]) {
  return employees.map((e) => ({
    Id: e.Id,
    Name: e.Name,
    Role: e.Role,
  }));
}
