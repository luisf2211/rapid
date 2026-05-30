import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { serializeInventoryPartOption } from "@/lib/inventory/client";
import { listActiveInventoryPartsForPicker } from "@/services/inventory.service";
import { listWorkOrders } from "@/services/work-orders.service";
import { NewMaterialRequisitionForm } from "./NewMaterialRequisitionForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ workOrderId?: string }>;
}

export default async function NewMaterialRequisitionPage({
  searchParams,
}: PageProps) {
  const { workOrderId } = await searchParams;
  const initialId = workOrderId ? Number(workOrderId) : undefined;

  let workOrders: Awaited<ReturnType<typeof listWorkOrders>> = [];
  let inventoryParts: Awaited<
    ReturnType<typeof listActiveInventoryPartsForPicker>
  > = [];

  try {
    [workOrders, inventoryParts] = await Promise.all([
      listWorkOrders({ take: 100 }),
      listActiveInventoryPartsForPicker(),
    ]);
  } catch {
    workOrders = [];
    inventoryParts = [];
  }

  const woOptions = workOrders.map((wo) => ({
    id: wo.id,
    orderNumber: wo.orderNumber,
    customerName: wo.customerName ?? "Sin cliente",
    brand: wo.brand ?? "",
    model: wo.model ?? "",
    plate: wo.plate ?? "",
  }));

  const partOptions = inventoryParts.map(serializeInventoryPartOption);

  return (
    <>
      <PageHeader
        title="Nueva requisición de materiales"
        subtitle="Los materiales se toman del inventario y descuentan stock al guardar."
        actions={
          <Link href="/material-requisitions" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewMaterialRequisitionForm
        workOrders={woOptions}
        inventoryParts={partOptions}
        initialWorkOrderId={
          initialId && Number.isFinite(initialId) ? initialId : undefined
        }
      />
    </>
  );
}
