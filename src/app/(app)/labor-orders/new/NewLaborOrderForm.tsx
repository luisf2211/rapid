"use client";

import {
  LaborOrderForm,
  type WorkOrderOption,
  type EmployeeOption,
} from "@/components/labor-order/LaborOrderForm";

interface Props {
  workOrders: WorkOrderOption[];
  employees: EmployeeOption[];
  initialWorkOrderId?: number;
}

export function NewLaborOrderForm({
  workOrders,
  employees,
  initialWorkOrderId,
}: Props) {
  const firstEmployee = employees[0];
  return (
    <LaborOrderForm
      mode="create"
      workOrders={workOrders}
      employees={employees}
      cancelHref="/labor-orders"
      defaultValues={{
        workOrderId: initialWorkOrderId ?? workOrders[0]?.id ?? 0,
        employeeId: firstEmployee?.id ?? 0,
        items: [
          {
            partName: "",
            quantity: 1,
            unitPrice: firstEmployee?.defaultUnitPrice ?? 0,
          },
        ],
      }}
    />
  );
}
