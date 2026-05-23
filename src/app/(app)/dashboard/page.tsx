import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Boxes,
  Wrench,
  ArrowRight,
  Activity,
  TimerReset,
} from "lucide-react";
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

  return (
    <>
      <PageHeader
        breadcrumb="Inicio"
        title="Dashboard"
        subtitle="Estado general del taller. Datos en tiempo real desde SQL Server."
        badge={
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-rapid-green/30 bg-rapid-green-soft/60 text-rapid-green-dark text-xs font-semibold">
            <span className="dot-live" />
            Live
          </span>
        }
        actions={
          <Link href="/work-orders/new" className="btn-primary">
            <ClipboardList className="w-4 h-4" />
            Nueva orden de recepción
          </Link>
        }
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800">
            No se pudo conectar a la base de datos
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Verifica que SQL Server esté disponible en{" "}
            <code className="font-mono">localhost:1433</code> y que la base de
            datos <code className="font-mono">Rapid</code> exista. Detalle:{" "}
            <span className="font-mono break-all">{error}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Total de órdenes"
          value={stats?.totalOrders ?? 0}
          hint="Histórico"
          icon={<ClipboardList className="w-5 h-5" />}
          accent="dark"
        />
        <SummaryCard
          label="Órdenes recibidas"
          value={stats?.receivedOrders ?? 0}
          hint="Pendientes de iniciar"
          icon={<TimerReset className="w-5 h-5" />}
          accent="green"
        />
        <SummaryCard
          label="Total materiales"
          value={formatMoney(stats?.totalMaterials ?? 0)}
          hint="Acumulado"
          icon={<Boxes className="w-5 h-5" />}
        />
        <SummaryCard
          label="Total mano de obra"
          value={formatMoney(stats?.totalLabor ?? 0)}
          hint="Acumulado"
          icon={<Wrench className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
            En proceso
          </p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold">{stats?.inProgressOrders ?? 0}</p>
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs text-rapid-text-muted mt-1.5">
            Vehículos actualmente en el taller
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
            Completadas
          </p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-bold">{stats?.completedOrders ?? 0}</p>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-xs text-rapid-text-muted mt-1.5">
            Listas para entrega
          </p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-rapid-black to-[#1a201e] text-white border-rapid-black">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
            Total general
          </p>
          <p className="text-3xl font-bold mt-2 text-rapid-green">
            {formatMoney(
              (stats?.totalMaterials ?? 0) + (stats?.totalLabor ?? 0),
            )}
          </p>
          <p className="text-xs text-white/50 mt-1.5">
            Materiales + Mano de obra
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rapid-border">
          <div>
            <h2 className="font-bold text-lg">Últimas órdenes</h2>
            <p className="text-xs text-rapid-text-muted">
              Las {stats?.recentOrders?.length ?? 0} más recientes
            </p>
          </div>
          <Link
            href="/work-orders"
            className="text-xs font-semibold text-rapid-green-dark hover:underline inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!stats?.recentOrders?.length ? (
          <div className="p-10 text-center">
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
              <thead className="bg-rapid-bg/60 text-xs uppercase tracking-wider text-rapid-text-muted">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Orden</th>
                  <th className="text-left font-semibold px-5 py-3">Cliente</th>
                  <th className="text-left font-semibold px-5 py-3">Vehículo</th>
                  <th className="text-left font-semibold px-5 py-3">Placa</th>
                  <th className="text-left font-semibold px-5 py-3">Estado</th>
                  <th className="text-left font-semibold px-5 py-3">Fecha</th>
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
                        className="text-xs font-semibold text-rapid-green-dark hover:underline inline-flex items-center gap-1"
                      >
                        Detalle <ArrowRight className="w-3 h-3" />
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
