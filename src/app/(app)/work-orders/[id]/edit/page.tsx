import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getWorkOrderById } from "@/services/work-orders.service";
import { canEditWorkOrderReception } from "@/lib/work-order/can-edit";
import { workOrderToFormValues } from "@/lib/work-order/form-mapper";
import { EditWorkOrderForm } from "./EditWorkOrderForm";

export const dynamic = "force-dynamic";

export default async function EditWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const order = await getWorkOrderById(id);
  if (!order) notFound();

  if (!canEditWorkOrderReception(order.status)) {
    return (
      <>
        <PageHeader
          title={`Orden #${String(order.orderNumber).padStart(5, "0")}`}
          subtitle="No se puede editar la recepción"
        />
        <div className="card p-5 text-sm">
          <p className="text-rapid-text-muted">
            Las órdenes entregadas o canceladas no se pueden modificar. Puedes
            consultar e imprimir la hoja de recepción.
          </p>
          <Link
            href={`/work-orders/${id}`}
            className="btn-primary inline-flex mt-4"
          >
            Ver orden
          </Link>
        </div>
      </>
    );
  }

  const initialValues = workOrderToFormValues(order);

  return (
    <div className="max-w-4xl pb-8">
      <Link
        href={`/work-orders/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-rapid-text-muted hover:text-rapid-text mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Orden #{String(order.orderNumber).padStart(5, "0")}
      </Link>
      <PageHeader
        title="Editar recepción"
        subtitle={order.customerName ?? "Sin cliente"}
      />
      <EditWorkOrderForm
        workOrderId={order.id}
        orderNumber={order.orderNumber}
        initialValues={initialValues}
      />
    </div>
  );
}
