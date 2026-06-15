import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { serializeInventoryPartOption } from "@/lib/inventory/client";
import { listActiveInventoryPartsForPicker } from "@/services/inventory.service";
import { listWorkOrders } from "@/services/work-orders.service";
import { NewMaterialRequisitionForm } from "./NewMaterialRequisitionForm";
import { INVENTORY_PART_TYPES } from "@/lib/constants";

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
  let materialPartsRaw: Awaited<
    ReturnType<typeof listActiveInventoryPartsForPicker>
  > = [];
  let paintPartsRaw: Awaited<
    ReturnType<typeof listActiveInventoryPartsForPicker>
  > = [];

  try {
    [workOrders, materialPartsRaw, paintPartsRaw] = await Promise.all([
      listWorkOrders({ take: 100 }),
      listActiveInventoryPartsForPicker({
        partType: INVENTORY_PART_TYPES.MATERIAL,
      }),
      listActiveInventoryPartsForPicker({
        partType: INVENTORY_PART_TYPES.PAINT,
      }),
    ]);
  } catch {
    workOrders = [];
    materialPartsRaw = [];
    paintPartsRaw = [];
  }

  const woOptions = workOrders.map((wo) => ({
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
        title="Nueva requisición de materiales"
        subtitle="Materiales y pintura se registran por separado y descuentan su propio inventario."
        actions={
          <Link href="/material-requisitions" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewMaterialRequisitionForm
        workOrders={woOptions}
        materialParts={materialPartsRaw.map(serializeInventoryPartOption)}
        paintParts={paintPartsRaw.map(serializeInventoryPartOption)}
        initialWorkOrderId={
          initialId && Number.isFinite(initialId) ? initialId : undefined
        }
      />
    </>
  );
}
