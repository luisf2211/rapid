import { WORK_ORDER_STATUS } from "@/lib/constants";

/** Recepción editable salvo orden entregada o cancelada. */
export function canEditWorkOrderReception(status: string): boolean {
  return (
    status !== WORK_ORDER_STATUS.DELIVERED &&
    status !== WORK_ORDER_STATUS.CANCELLED
  );
}
