import Link from "next/link";
import { Plus, Search, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listWorkOrders } from "@/services/work-orders.service";
import { WorkOrdersTable } from "@/components/work-order/WorkOrdersTable";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function WorkOrdersPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams;

  let orders: Awaited<ReturnType<typeof listWorkOrders>> = [];
  let error: string | null = null;
  try {
    orders = await listWorkOrders({ search: q, status });
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const tableItems = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    brand: o.brand,
    model: o.model,
    vehicleYear: o.vehicleYear,
    plate: o.plate,
    status: o.status,
    materialCount: o._count.materialRequisitions,
    laborCount: o._count.laborOrders,
    createdAt: o.createdAt,
  }));

  return (
    <>
      <PageHeader
        title="Órdenes de recepción"
        subtitle="Listado completo de órdenes registradas en el taller."
        actions={
          <Link href="/work-orders/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Nueva orden
          </Link>
        }
      />

      {/* Filter bar */}
      <form
        method="get"
        className="card p-3 mb-4 flex flex-col sm:flex-row gap-2 sm:items-center"
      >
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rapid-text-muted"
            aria-hidden
          />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por cliente, placa, marca, modelo..."
            className="form-input w-full pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="form-input sm:w-44 shrink-0"
        >
          <option value="">Todos los estados</option>
          <option value="RECEIVED">Recibida</option>
          <option value="IN_PROGRESS">En proceso</option>
          <option value="COMPLETED">Completada</option>
          <option value="DELIVERED">Entregada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
        <button type="submit" className="btn-dark shrink-0">
          Buscar
        </button>
      </form>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          No se pudo cargar el listado.
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="card p-12 text-center">
          <ClipboardList className="w-10 h-10 mx-auto text-rapid-text-muted-soft mb-3" />
          <p className="text-sm font-medium text-rapid-text">Sin órdenes</p>
          <p className="text-xs text-rapid-text-muted mt-1 max-w-sm mx-auto">
            No hay órdenes que coincidan con los filtros.
          </p>
          <Link href="/work-orders/new" className="btn-primary inline-flex mt-4">
            <Plus className="w-4 h-4" /> Crear orden
          </Link>
        </div>
      )}

      {!error && orders.length > 0 && <WorkOrdersTable items={tableItems} />}
    </>
  );
}
