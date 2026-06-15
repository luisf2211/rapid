"use client";

import { WorkOrderForm } from "@/components/work-order/WorkOrderForm";
import type { WorkOrderFormValues } from "@/lib/validations/work-order";

interface Props {
  defaultValues: WorkOrderFormValues;
}

export function NewWorkOrderForm({ defaultValues }: Props) {
  return (
    <WorkOrderForm
      mode="create"
      cancelHref="/work-orders"
      defaultValues={defaultValues}
    />
  );
}
