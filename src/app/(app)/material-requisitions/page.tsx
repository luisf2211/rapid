import Link from "next/link";
import { Plus, Boxes } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listMaterialRequisitions } from "@/services/material-requisitions.service";
import { formatMoney } from "@/lib/formatters/money";
import { formatDateTime } from "@/lib/formatters/date";

export const dynamic = "force-dynamic";

export default async function MaterialRequisitionsPage() {
  let items: Awaited<ReturnType<typeof listMaterialRequisitions>> = [];
  let error: string | null = null;
  try {
    items = await listMaterialRequisitions();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Requisición de materiales"
        subtitle="Todas las requisiciones registradas en el taller."
        actions={
          <Link href="/work-orders" className="btn-primary">
            <Plus className="w-4 h-4" /> Nueva requisición
          </Link>
        }
      />

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

      <div className="card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-rapid-green-soft text-rapid-green-dark flex items-center justify-center mx-auto mb-3">
              <Boxes className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-rapid-text">Sin requisiciones</p>
            <p className="text-xs text-rapid-text-muted mt-1 max-w-sm mx-auto">
              Crea una requisición desde el detalle de una orden de recepción.
            </p>
            <Link href="/work-orders" className="btn-primary mt-4 inline-flex">
              Ir a órdenes
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rapid-border bg-rapid-surface-soft">
                  <th className="table-header">Requisición</th>
                  <th className="table-header">Orden / Cliente</th>
                  <th className="table-header">Vehículo</th>
                  <th className="table-header text-center">Items</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header w-20" />
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="table-row">
                    <td className="table-cell font-mono text-[11px] font-medium text-rapid-text-muted">
                      RM-{String(it.id).padStart(5, "0")}
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-rapid-text">
                        {it.workOrder.customerName ?? "—"}
                      </p>
                      <p className="text-[11px] text-rapid-text-muted font-mono">
                        #{String(it.workOrder.orderNumber).padStart(5, "0")}
                      </p>
                    </td>
                    <td className="table-cell text-rapid-text-muted">
                      {it.workOrder.brand ?? ""} {it.workOrder.model ?? ""}{" "}
                      <span className="font-mono text-[11px]">
                        · {it.workOrder.plate ?? "—"}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rapid-surface-strong text-rapid-text-muted font-mono text-[11px]">
                        {it.items.length}
                      </span>
                    </td>
                    <td className="table-cell text-right tabular-nums font-semibold text-rapid-green-dark">
                      {formatMoney(Number(it.total ?? 0))}
                    </td>
                    <td className="table-cell text-[11px] text-rapid-text-muted">
                      {formatDateTime(it.createdAt)}
                    </td>
                    <td className="table-cell text-right">
                      <Link
                        href={`/material-requisitions/${it.id}`}
                        className="text-xs font-medium text-rapid-green-dark hover:underline"
                      >
                        Ver →
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
