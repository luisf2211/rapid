import Link from "next/link";
import { ClipboardList, Boxes, Wrench, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getDashboardStats } from "@/services/work-orders.service";
import { formatMoney } from "@/lib/formatters/money";
import { formatDateTime } from "@/lib/formatters/date";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null;
  let error: string | null = null;
  try {
    stats = await getDashboardStats();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const totalGeneral =
    (stats?.totalMaterials ?? 0) + (stats?.totalLabor ?? 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de actividad del taller."
        actions={
          <Link href="/work-orders/new" className="btn-primary">
            <ClipboardList className="w-4 h-4" />
            Nueva orden
          </Link>
        }
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800">
            No se pudo conectar a la base de datos
          </p>
          <p className="text-xs text-amber-700 mt-1 font-mono break-all">
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <SummaryCard
          label="Total de órdenes"
          value={stats?.totalOrders ?? 0}
          hint="Histórico"
        />
        <SummaryCard
          label="Recibidas"
          value={stats?.receivedOrders ?? 0}
          hint="Pendientes de iniciar"
        />
        <SummaryCard
          label="En proceso"
          value={stats?.inProgressOrders ?? 0}
          hint="En el taller"
        />
        <SummaryCard
          label="Completadas"
          value={stats?.completedOrders ?? 0}
          hint="Listas para entrega"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard
          label="Materiales"
          value={formatMoney(stats?.totalMaterials ?? 0)}
          hint="Acumulado"
          icon={<Boxes className="w-4 h-4" />}
        />
        <SummaryCard
          label="Mano de obra"
          value={formatMoney(stats?.totalLabor ?? 0)}
          hint="Acumulado"
          icon={<Wrench className="w-4 h-4" />}
        />
        <SummaryCard
          label="Total general"
          value={formatMoney(totalGeneral)}
          hint="Materiales + mano de obra"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-rapid-border">
          <h2 className="font-semibold text-rapid-text">Últimas órdenes</h2>
          <Link
            href="/work-orders"
            className="text-sm text-rapid-text-muted hover:text-rapid-text transition"
          >
            Ver todas →
          </Link>
        </div>

        {!stats?.recentOrders?.length ? (
          <div className="p-12 text-center">
            <p className="text-sm text-rapid-text-muted">
              No hay órdenes registradas todavía.
            </p>
            <Link
              href="/work-orders/new"
              className="btn-primary mt-4 inline-flex"
            >
              Crear primera orden
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rapid-bg/60 text-xs text-rapid-text-muted">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Orden</th>
                  <th className="text-left font-medium px-5 py-3">Cliente</th>
                  <th className="text-left font-medium px-5 py-3">Vehículo</th>
                  <th className="text-left font-medium px-5 py-3">Placa</th>
                  <th className="text-left font-medium px-5 py-3">Estado</th>
                  <th className="text-left font-medium px-5 py-3">Fecha</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-rapid-border hover:bg-rapid-bg/40 transition"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold">
                      #{String(o.orderNumber).padStart(5, "0")}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {o.customerName ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-rapid-text-muted">
                      {o.brand ?? ""} {o.model ?? ""}{" "}
                      {o.vehicleYear ?? ""}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs uppercase">
                      {o.plate ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-rapid-text-muted text-xs">
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
