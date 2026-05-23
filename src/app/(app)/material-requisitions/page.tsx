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
        breadcrumb="Operaciones"
        title="Requisición de materiales"
        subtitle="Todas las requisiciones registradas en el taller, agrupadas por orden."
        actions={
          <Link href="/work-orders" className="btn-primary">
            <Plus className="w-4 h-4" /> Nueva requisición
          </Link>
        }
      />

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
        {items.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-12 h-12 rounded-xl bg-rapid-green-soft text-rapid-green-dark flex items-center justify-center mx-auto mb-3">
              <Boxes className="w-6 h-6" />
            </div>
            <p className="font-semibold text-rapid-text">Sin requisiciones</p>
            <p className="text-sm text-rapid-text-muted mt-1 max-w-sm mx-auto">
              Crea una requisición desde el detalle de una orden de recepción.
            </p>
            <Link href="/work-orders" className="btn-primary mt-4 inline-flex">
              Ir a órdenes
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rapid-bg/60 text-xs uppercase tracking-wider text-rapid-text-muted">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">
                    Requisición
                  </th>
                  <th className="text-left font-semibold px-5 py-3">
                    Orden / Cliente
                  </th>
                  <th className="text-left font-semibold px-5 py-3">
                    Vehículo
                  </th>
                  <th className="text-center font-semibold px-5 py-3">Items</th>
                  <th className="text-right font-semibold px-5 py-3">Total</th>
                  <th className="text-left font-semibold px-5 py-3">Fecha</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.id}
                    className="border-t border-rapid-border hover:bg-rapid-bg/30"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold">
                      RM-{String(it.id).padStart(5, "0")}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">
                        {it.workOrder.customerName ?? "—"}
                      </p>
                      <p className="text-xs text-rapid-text-muted font-mono">
                        #{String(it.workOrder.orderNumber).padStart(5, "0")}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-rapid-text-muted">
                      {it.workOrder.brand ?? ""} {it.workOrder.model ?? ""}{" "}
                      <span className="font-mono text-xs">
                        · {it.workOrder.plate ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rapid-bg text-rapid-text font-mono text-xs">
                        {it.items.length}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-bold text-rapid-green-dark">
                      {formatMoney(Number(it.total ?? 0))}
                    </td>
                    <td className="px-5 py-3 text-xs text-rapid-text-muted">
                      {formatDateTime(it.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/work-orders/${it.workOrderId}`}
                        className="text-xs font-semibold text-rapid-green-dark hover:underline"
                      >
                        Ver orden →
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
