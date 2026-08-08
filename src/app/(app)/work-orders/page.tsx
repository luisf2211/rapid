import Link from "next/link";
import { Plus, Search, ClipboardList, ArrowRight } from "lucide-react";
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

      {/* Filter bar */}
      <form
        method="get"
        className="mb-4 flex flex-col sm:flex-row gap-2"
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
          Filtrar
        </button>
      </form>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4">
          <p className="text-sm font-medium text-amber-800">
            No se pudo conectar a la base de datos
          </p>
          <p className="text-xs text-amber-700 mt-1 font-mono break-all">
            {error}
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-rapid-green-soft text-rapid-green-dark flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-rapid-text">Sin órdenes</p>
          <p className="text-xs text-rapid-text-muted mt-1 max-w-sm mx-auto">
            No hay órdenes que coincidan con los filtros. Crea una nueva
            orden de recepción para comenzar.
          </p>
          <Link href="/work-orders/new" className="btn-primary mt-4 inline-flex">
            <Plus className="w-4 h-4" /> Crear orden
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rapid-border bg-rapid-surface-soft">
                  <th className="table-header">Orden</th>
                  <th className="table-header">Cliente</th>
                  <th className="table-header hidden md:table-cell">Vehículo</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header text-center hidden lg:table-cell">Mat.</th>
                  <th className="table-header text-center hidden lg:table-cell">MO</th>
                  <th className="table-header hidden xl:table-cell">Recibida</th>
                  <th className="table-header w-12" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="table-row group"
                  >
                    <td className="table-cell whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold bg-rapid-surface-strong text-rapid-text-muted px-1.5 py-0.5 rounded">
                        #{String(o.orderNumber).padStart(5, "0")}
                      </span>
                    </td>
                    <td className="table-cell min-w-[130px]">
                      <p className="font-medium text-rapid-text leading-tight">
                        {o.customerName ?? "—"}
                      </p>
                      {o.phone && (
                        <p className="text-[11px] text-rapid-text-muted mt-0.5">
                          {o.phone}
                        </p>
                      )}
                    </td>
                    <td className="table-cell hidden md:table-cell min-w-[140px]">
                      <p className="font-medium text-rapid-text">
                        {[o.brand, o.model].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-[11px] text-rapid-text-muted mt-0.5">
                        {[
                          o.vehicleYear ? String(o.vehicleYear) : null,
                          o.plate ?? null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="table-cell text-center hidden lg:table-cell">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rapid-surface-strong text-rapid-text-muted text-[11px] font-medium tabular-nums">
                        {o._count.materialRequisitions}
                      </span>
                    </td>
                    <td className="table-cell text-center hidden lg:table-cell">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rapid-surface-strong text-rapid-text-muted text-[11px] font-medium tabular-nums">
                        {o._count.laborOrders}
                      </span>
                    </td>
                    <td className="table-cell hidden xl:table-cell whitespace-nowrap">
                      <p className="text-[11px] text-rapid-text-muted">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </td>
                    <td className="table-cell text-right whitespace-nowrap">
                      <Link
                        href={`/work-orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rapid-text-muted hover:text-rapid-text transition-colors"
                      >
                        Ver
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-rapid-border bg-rapid-surface-soft">
            <p className="text-[11px] text-rapid-text-muted">
              {orders.length} orden{orders.length !== 1 ? "es" : ""}
              {q || status ? " (filtradas)" : ""}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
