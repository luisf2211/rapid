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
        className="mb-5 flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rapid-text-muted"
            aria-hidden
          />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por cliente, placa, marca, modelo…"
            className="form-input w-full pl-10 h-12"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="form-input h-12 sm:w-52 shrink-0 pr-9 appearance-none bg-no-repeat bg-[length:16px_16px] bg-[right_0.75rem_center] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]"
        >
          <option value="">Todos los estados</option>
          <option value="RECEIVED">Recibida</option>
          <option value="IN_PROGRESS">En proceso</option>
          <option value="COMPLETED">Completada</option>
          <option value="DELIVERED">Entregada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
        <button type="submit" className="btn-dark h-12 px-5 shrink-0">
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

      {orders.length === 0 ? (
        <div className="card p-14 text-center">
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
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rapid-surface-soft border-b border-rapid-border">
                  <th className="text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted px-5 py-3">
                    Orden
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted px-5 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted px-5 py-3 hidden md:table-cell">
                    Vehículo
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted px-5 py-3">
                    Estado
                  </th>
                  <th className="text-center text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted px-4 py-3 hidden lg:table-cell">
                    Mat.
                  </th>
                  <th className="text-center text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted px-4 py-3 hidden lg:table-cell">
                    MO
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted px-5 py-3 hidden xl:table-cell">
                    Recibida
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-rapid-border">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="group hover:bg-rapid-surface-soft transition-colors"
                  >
                    {/* Order number */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold bg-rapid-black text-rapid-green px-2 py-1 rounded-md">
                        #{String(o.orderNumber).padStart(5, "0")}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4 min-w-[140px]">
                      <p className="font-semibold text-rapid-text leading-tight">
                        {o.customerName ?? "—"}
                      </p>
                      {o.phone && (
                        <p className="text-xs text-rapid-text-muted mt-0.5">
                          {o.phone}
                        </p>
                      )}
                    </td>

                    {/* Vehicle */}
                    <td className="px-5 py-4 hidden md:table-cell min-w-[160px]">
                      <p className="font-medium text-rapid-text">
                        {[o.brand, o.model].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-xs text-rapid-text-muted mt-0.5">
                        {[
                          o.vehicleYear ? String(o.vehicleYear) : null,
                          o.plate ?? null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={o.status} />
                    </td>

                    {/* Material count */}
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rapid-surface-strong text-rapid-text-muted text-xs font-bold tabular-nums">
                        {o._count.materialRequisitions}
                      </span>
                    </td>

                    {/* Labor count */}
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rapid-surface-strong text-rapid-text-muted text-xs font-bold tabular-nums">
                        {o._count.laborOrders}
                      </span>
                    </td>

                    {/* Created at */}
                    <td className="px-5 py-4 hidden xl:table-cell whitespace-nowrap">
                      <p className="text-xs text-rapid-text-muted">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </td>

                    {/* CTA */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/work-orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rapid-border text-xs font-semibold text-rapid-text hover:bg-rapid-surface-soft hover:shadow-float transition"
                      >
                        Ver
                        <ArrowRight className="w-3.5 h-3.5 text-rapid-text-muted group-hover:text-rapid-text transition" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-5 py-2.5 border-t border-rapid-border bg-rapid-surface-soft">
            <p className="text-xs text-rapid-text-muted">
              {orders.length} orden{orders.length !== 1 ? "es" : ""}
              {q || status ? " (filtradas)" : ""}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
