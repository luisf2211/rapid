import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listWorkOrders } from "@/services/work-orders.service";
import { listActiveEmployeesForPicker } from "@/services/employees.service";
import { mapEmployeesForPicker } from "@/lib/employee/picker";
import { NewLaborOrderForm } from "./NewLaborOrderForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ workOrderId?: string }>;
}

export default async function NewLaborOrderPage({ searchParams }: PageProps) {
  const { workOrderId } = await searchParams;
  const initialId = workOrderId ? Number(workOrderId) : undefined;

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

  return (
    <>
      <PageHeader
        title="Nueva orden de mano de obra"
        subtitle="Registra un técnico y las piezas que trabajó (cantidad por pieza)."
        actions={
          <Link href="/labor-orders" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewLaborOrderForm
        workOrders={options}
        employees={mapEmployeesForPicker(employees)}
        initialWorkOrderId={
          initialId && Number.isFinite(initialId) ? initialId : undefined
        }
      />
    </>
  );
}
