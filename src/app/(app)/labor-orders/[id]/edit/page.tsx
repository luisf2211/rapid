import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listWorkOrders } from "@/services/work-orders.service";
import { getLaborOrderById } from "@/services/labor-orders.service";
import { getLatestInvoiceForWorkOrder } from "@/services/invoices.service";
import { canEditLaborOrder } from "@/lib/labor-order/can-edit";
import { listActiveEmployeesForPicker } from "@/services/employees.service";
import { mapEmployeesForPicker } from "@/lib/employee/picker";
import { laborOrderToFormValues, laborOrderDisplayWorker } from "@/lib/labor-order/form-mapper";
import { EditLaborOrderForm } from "./EditLaborOrderForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLaborOrderPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const lo = await getLaborOrderById(id);
  if (!lo) notFound();

  const invoice = await getLatestInvoiceForWorkOrder(lo.workOrderId);
  if (!canEditLaborOrder(invoice?.status)) {
    return (
      <>
        <PageHeader
          title={`MO-${String(lo.id).padStart(5, "0")}`}
          subtitle="No se puede editar"
        />
        <div className="card p-5 text-sm">
          <p className="text-rapid-text-muted">
            La orden de recepción tiene una factura pagada o anulada. Consulta
            el registro sin modificarlo.
          </p>
          <Link
            href={`/labor-orders/${id}`}
            className="btn-primary inline-flex mt-4"
          >
            Ver mano de obra
          </Link>
        </div>
      </>
    );
  }

  let workOrders: Awaited<ReturnType<typeof listWorkOrders>> = [];
  let employees: Awaited<ReturnType<typeof listActiveEmployeesForPicker>> = [];
  try {
    [workOrders, employees] = await Promise.all([
      listWorkOrders({ take: 100 }),
      listActiveEmployeesForPicker(),
    ]);
  } catch {
    workOrders = [];
    employees = [];
  }

  const options = workOrders.map((wo) => ({
    id: wo.id,
    orderNumber: wo.orderNumber,
    customerName: wo.customerName ?? "Sin cliente",
    brand: wo.brand ?? "",
    model: wo.model ?? "",
    plate: wo.plate ?? "",
  }));

  const initialValues = laborOrderToFormValues(lo);

  return (
    <>
      <Link
        href={`/labor-orders/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-rapid-text-muted hover:text-rapid-text mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        MO-{String(lo.id).padStart(5, "0")}
      </Link>
      <PageHeader
        title="Editar mano de obra"
        subtitle={laborOrderDisplayWorker(lo)}
      />
      <EditLaborOrderForm
        laborOrderId={lo.id}
        initialValues={initialValues}
        workOrders={options}
        employees={mapEmployeesForPicker(employees)}
      />
    </>
  );
}
