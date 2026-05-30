import Link from "next/link";
import { Plus, Search, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listWorkOrders } from "@/services/work-orders.service";
import { formatDateTime } from "@/lib/formatters/date";

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

      <form
        method="get"
        className="card p-4 mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_11.5rem_auto] md:items-center"
      >
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rapid-text-muted"
            aria-hidden
          />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por cliente, placa, marca, modelo..."
            className="form-input w-full pl-10"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="form-input w-full pr-9 appearance-none bg-no-repeat bg-[length:16px_16px] bg-[right_0.75rem_center] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]"
        >
          <option value="">Todos los estados</option>
          <option value="RECEIVED">Recibida</option>
          <option value="IN_PROGRESS">En proceso</option>
          <option value="COMPLETED">Completada</option>
          <option value="DELIVERED">Entregada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
        <button type="submit" className="btn-dark w-full md:w-auto justify-self-stretch md:justify-self-auto">
          Filtrar
        </button>
      </form>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4">
          <p className="text-sm font-semibold text-amber-800">
            No se pudo conectar a la base de datos
          </p>
          <p className="text-xs text-amber-700 mt-1 font-mono break-all">
            {error}
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-12 h-12 rounded-xl bg-rapid-green-soft text-rapid-green-dark flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="font-semibold text-rapid-text">Sin órdenes</p>
            <p className="text-sm text-rapid-text-muted mt-1 max-w-sm mx-auto">
              No hay órdenes que coincidan con los filtros. Crea una nueva
              orden de recepción para comenzar.
            </p>
            <Link href="/work-orders/new" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Crear orden
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rapid-bg/60 text-xs uppercase tracking-wider text-rapid-text-muted">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Orden</th>
                  <th className="text-left font-semibold px-5 py-3">Cliente</th>
                  <th className="text-left font-semibold px-5 py-3">
                    Vehículo
                  </th>
                  <th className="text-left font-semibold px-5 py-3">Placa</th>
                  <th className="text-left font-semibold px-5 py-3">Estado</th>
                  <th className="text-center font-semibold px-5 py-3">
                    Material
                  </th>
                  <th className="text-center font-semibold px-5 py-3">
                    Mano obra
                  </th>
                  <th className="text-left font-semibold px-5 py-3">
                    Recibida
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-rapid-border hover:bg-rapid-bg/40 transition"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold">
                      #{String(o.orderNumber).padStart(5, "0")}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-rapid-text">
                        {o.customerName ?? "—"}
                      </p>
                      {o.phone && (
                        <p className="text-xs text-rapid-text-muted">
                          {o.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-rapid-text-muted">
                      <p>
                        {o.brand ?? ""} {o.model ?? ""}
                      </p>
                      <p className="text-xs">
                        {o.vehicleYear ?? "—"} · {o.color ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs uppercase">
                      {o.plate ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-center text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rapid-bg text-rapid-text-muted font-mono">
                        {o._count.materialRequisitions}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rapid-bg text-rapid-text-muted font-mono">
                        {o._count.laborOrders}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-rapid-text-muted">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/work-orders/${o.id}`}
                        className="text-xs font-semibold text-rapid-green-dark hover:underline"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
