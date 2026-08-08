import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { listEmployees, getEmployeeStats } from "@/services/employees.service";
import { formatMoney } from "@/lib/formatters/money";
import { toPlainNumber } from "@/lib/serialize";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function EmployeesPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  let items: Awaited<ReturnType<typeof listEmployees>> = [];
  let stats: Awaited<ReturnType<typeof getEmployeeStats>> | null = null;
  let error: string | null = null;

  try {
    [items, stats] = await Promise.all([
      listEmployees({ search: q }),
      getEmployeeStats(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Empleados"
        subtitle="Técnicos del taller con tarifa por pieza."
        actions={
          <Link href="/employees/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Nuevo empleado
          </Link>
        }
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4 max-w-md">
          <SummaryCard label="Total" value={stats.total} />
          <SummaryCard label="Activos" value={stats.active} />
        </div>
      )}

      <form method="get" className="card p-3 mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre, rol o teléfono..."
          className="form-input flex-1"
        />
        <button type="submit" className="btn-secondary">
          Buscar
        </button>
      </form>

      <div className="card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto text-rapid-text-muted-soft mb-3" />
            <p className="text-sm font-medium text-rapid-text">Sin empleados</p>
            <Link href="/employees/new" className="btn-primary mt-4 inline-flex">
              Registrar empleado
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rapid-border bg-rapid-surface-soft">
                <th className="table-header">Nombre</th>
                <th className="table-header">Rol</th>
                <th className="table-header text-right">Tarifa/pieza</th>
                <th className="table-header text-center">Estado</th>
                <th className="table-header w-12" />
              </tr>
            </thead>
            <tbody>
              {items.map((emp) => (
                <tr key={emp.Id} className="table-row">
                  <td className="table-cell font-medium text-rapid-text">
                    {emp.Name}
                    {emp.IsExternal && (
                      <span className="ml-2 text-[11px] text-rapid-text-muted">(externo)</span>
                    )}
                  </td>
                  <td className="table-cell text-rapid-text-muted">{emp.Role}</td>
                  <td className="table-cell text-right font-mono tabular-nums">
                    {formatMoney(toPlainNumber(emp.DefaultUnitPrice) ?? 0)}
                  </td>
                  <td className="table-cell text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        emp.IsActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                          : "bg-gray-50 text-gray-600 border-gray-200/80"
                      }`}
                    >
                      {emp.IsActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <Link
                      href={`/employees/${emp.Id}`}
                      className="text-xs font-medium text-rapid-green-dark hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
