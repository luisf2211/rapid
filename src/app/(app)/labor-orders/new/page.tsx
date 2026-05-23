import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listWorkOrders } from "@/services/work-orders.service";
import { NewLaborOrderForm } from "./NewLaborOrderForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ workOrderId?: string }>;
}

export default async function NewLaborOrderPage({ searchParams }: PageProps) {
  const { workOrderId } = await searchParams;
  const initialId = workOrderId ? Number(workOrderId) : undefined;

  let workOrders: Awaited<ReturnType<typeof listWorkOrders>> = [];
  try {
    workOrders = await listWorkOrders({ take: 100 });
  } catch {
    workOrders = [];
  }

  const options = workOrders.map((wo) => ({
    id: wo.id,
    orderNumber: wo.orderNumber,
    customerName: wo.customerName ?? "Sin cliente",
    brand: wo.brand ?? "",
    model: wo.model ?? "",
    plate: wo.plate ?? "",
  }));

  return (
    <>
      <PageHeader
        breadcrumb={
          <>
            <Link href="/labor-orders" className="hover:underline">
              Mano de obra
            </Link>{" "}
            · Nueva
          </>
        }
        title="Nueva orden de mano de obra"
        subtitle="Selecciona la orden y desglosa el costo de cada pieza."
        actions={
          <Link href="/labor-orders" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewLaborOrderForm
        workOrders={options}
        initialWorkOrderId={
          initialId && Number.isFinite(initialId) ? initialId : undefined
        }
      />
    </>
  );
}
