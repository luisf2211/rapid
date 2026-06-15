import Link from "next/link";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";
import {
  availableQuantity,
  getInventoryStats,
  listInventoryParts,
} from "@/services/inventory.service";
import { formatMoney } from "@/lib/formatters/money";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; filter?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { q, filter } = await searchParams;
  const filterValue =
    filter === "low" || filter === "inactive" ? filter : "all";

  let parts: Awaited<ReturnType<typeof listInventoryParts>> = [];
  let stats: Awaited<ReturnType<typeof getInventoryStats>> | null = null;
  let error: string | null = null;

  try {
    [parts, stats] = await Promise.all([
      listInventoryParts({ search: q, filter: filterValue, partType: "MATERIAL" }),
      getInventoryStats(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Inventario"
        subtitle="Materiales y consumibles (sin pintura)."
        actions={
          <>
            <Link href="/inventory/paint" className="btn-secondary">
              Inventario pintura
            </Link>
            <Link href="/inventory/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Nueva pieza
            </Link>
          </>
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
          <p className="text-xs text-amber-700 mt-2">
            Ejecuta el script{" "}
            <code className="font-mono">scripts/sql/create-inventory-tables.sql</code>{" "}
            y luego <code className="font-mono">npx prisma generate</code>.
          </p>
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

      <form
        method="get"
        className="card p-4 mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_11.5rem_auto] md:items-center"
      >
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre, SKU, categoría o ubicación..."
          className="form-input w-full"
        />
        <select name="filter" defaultValue={filterValue} className="form-input w-full">
          <option value="all">Todas</option>
          <option value="low">Sin stock / bajo mínimo</option>
          <option value="inactive">Inactivas</option>
        </select>
        <button type="submit" className="btn-dark w-full md:w-auto">
          Filtrar
        </button>
      </form>

      <div className="card overflow-hidden">
        {parts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-rapid-text-muted mx-auto mb-3" />
            <p className="text-sm text-rapid-text-muted">
              {filterValue === "low"
                ? "No hay piezas sin stock o bajo el mínimo."
                : "No hay piezas en inventario."}
            </p>
            <Link href="/inventory/new" className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4" /> Registrar primera pieza
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rapid-bg/60 text-xs text-rapid-text-muted">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Pieza</th>
                  <th className="text-left font-medium px-5 py-3">Categoría</th>
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
                        <p className="font-medium">
                          {p.name}
                          {!p.isActive && (
                            <span className="ml-2 text-xs text-rapid-text-muted">
                              (inactiva)
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-mono text-rapid-text-muted">
                          {p.sku}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-rapid-text-muted">
                        {p.category ?? "—"}
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
                        {Number(p.reservedQuantity) > 0 && (
                          <p className="text-xs text-rapid-text-muted">
                            reserv. {formatFractionQuantity(p.reservedQuantity)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {formatFractionQuantity(available)} {p.unit}
                        {p.minQuantity != null && (
                          <p className="text-xs text-rapid-text-muted">
                            mín. {formatFractionQuantity(p.minQuantity)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-rapid-text-muted">
                        {p.location ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-rapid-text-muted">
                        {p.unitCost != null
                          ? formatMoney(Number(p.unitCost))
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/inventory/${p.id}`}
                          className="text-xs font-semibold text-rapid-green-dark hover:underline"
                        >
                          Ver →
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
