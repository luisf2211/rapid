"use client";

import {
  LaborOrderForm,
  type WorkOrderOption,
  type EmployeeOption,
} from "@/components/labor-order/LaborOrderForm";
import type { LaborOrderFormValues } from "@/lib/validations/labor-order";

interface Props {
  laborOrderId: number;
  initialValues: LaborOrderFormValues;
  workOrders: WorkOrderOption[];
  employees: EmployeeOption[];
}

export function EditLaborOrderForm({
  laborOrderId,
  initialValues,
  workOrders,
  employees,
}: Props) {
  return (
    <LaborOrderForm
      mode="edit"
      laborOrderId={laborOrderId}
      workOrders={workOrders}
      employees={employees}
      lockWorkOrder
      cancelHref={`/labor-orders/${laborOrderId}`}
      defaultValues={initialValues}
    />
  );
}
