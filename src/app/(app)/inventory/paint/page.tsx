import Link from "next/link";
import { Plus, Droplets, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";
import {
  availableQuantity,
  getInventoryStats,
  listInventoryParts,
} from "@/services/inventory.service";
import { formatMoney } from "@/lib/formatters/money";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { INVENTORY_PART_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; filter?: string }>;
}

export default async function PaintInventoryPage({ searchParams }: PageProps) {
  const { q, filter } = await searchParams;
  const filterValue =
    filter === "low" || filter === "inactive" ? filter : "all";

  let parts: Awaited<ReturnType<typeof listInventoryParts>> = [];
  let stats: Awaited<ReturnType<typeof getInventoryStats>> | null = null;
  let error: string | null = null;

  try {
    [parts, stats] = await Promise.all([
      listInventoryParts({
        search: q,
        filter: filterValue,
        partType: INVENTORY_PART_TYPES.PAINT,
      }),
      getInventoryStats({ partType: INVENTORY_PART_TYPES.PAINT }),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Inventario de pintura"
        subtitle="Stock de pintura en galones u otras medidas. Se descuenta al usar en requisiciones."
        actions={
          <>
            <Link href="/inventory" className="btn-secondary">
              Materiales
            </Link>
            <Link href="/inventory/paint/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Nueva pintura
            </Link>
          </>
        }
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4">
          <p className="text-sm text-amber-900">{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <SummaryCard
            label="Piezas registradas"
            value={stats.totalParts}
            hint={`${stats.activeParts} activas`}
          />
          <SummaryCard
            label="Stock bajo"
            value={stats.lowStockCount}
            hint="Sin stock o bajo el mínimo"
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-rapid-border flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-rapid-green-dark" />
            <h2 className="font-bold">Pintura almacenada</h2>
          </div>
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar SKU o nombre..."
              className="form-input py-1.5 text-sm w-48"
            />
            <select name="filter" defaultValue={filterValue} className="form-input py-1.5 text-sm">
              <option value="all">Todos</option>
              <option value="low">Stock bajo</option>
              <option value="inactive">Inactivos</option>
            </select>
            <button type="submit" className="btn-secondary text-sm py-1.5">
              Filtrar
            </button>
          </form>
        </div>

        {parts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-rapid-text-muted mb-3">
              No hay pintura registrada en inventario.
            </p>
            <Link href="/inventory/paint/new" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" /> Registrar pintura
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rapid-bg/60 text-xs text-rapid-text-muted">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Producto</th>
                  <th className="text-right font-medium px-5 py-3">Existencia</th>
                  <th className="text-right font-medium px-5 py-3">Disponible</th>
                  <th className="text-left font-medium px-5 py-3">Ubicación</th>
                  <th className="text-right font-medium px-5 py-3">Costo</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => {
                  const available = availableQuantity(
                    p.quantityOnHand,
                    p.reservedQuantity,
                  );
                  const min = p.minQuantity != null ? Number(p.minQuantity) : null;
                  const low =
                    available <= 0 || (min != null && available <= min);
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-rapid-border hover:bg-rapid-bg/40"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs font-mono text-rapid-text-muted">
                          {p.sku}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={
                            low
                              ? "inline-flex items-center gap-1 font-semibold text-amber-700"
                              : "tabular-nums font-semibold"
                          }
                        >
                          {low && (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          )}
                          {formatFractionQuantity(p.quantityOnHand)} {p.unit}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {formatFractionQuantity(available)} {p.unit}
                      </td>
                      <td className="px-5 py-3 text-rapid-text-muted">
                        {p.location ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-rapid-text-muted">
                        {p.unitCost != null ? formatMoney(Number(p.unitCost)) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/inventory/${p.id}`}
                          className="text-rapid-green-dark hover:underline text-xs font-semibold"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
