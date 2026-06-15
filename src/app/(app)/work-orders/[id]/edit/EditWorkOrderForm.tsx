"use client";

import { WorkOrderForm } from "@/components/work-order/WorkOrderForm";
import type { WorkOrderFormValues } from "@/lib/validations/work-order";

interface Props {
  workOrderId: number;
  orderNumber: number;
  initialValues: WorkOrderFormValues;
}

export function EditWorkOrderForm({
  workOrderId,
  orderNumber,
  initialValues,
}: Props) {
  return (
    <WorkOrderForm
      mode="edit"
      workOrderId={workOrderId}
      orderNumber={orderNumber}
      cancelHref={`/work-orders/${workOrderId}`}
      defaultValues={initialValues}
    />
  );
}
