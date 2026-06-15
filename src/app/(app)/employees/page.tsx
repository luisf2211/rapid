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
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4 max-w-md">
          <SummaryCard label="Total" value={stats.total} />
          <SummaryCard label="Activos" value={stats.active} />
        </div>
      )}

      <form method="get" className="card p-4 mb-4 flex gap-2">
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
          <div className="p-14 text-center">
            <Users className="w-10 h-10 mx-auto text-rapid-text-muted mb-3" />
            <p className="font-semibold">Sin empleados</p>
            <Link href="/employees/new" className="btn-primary mt-4 inline-flex">
              Registrar empleado
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-rapid-bg/60 text-xs uppercase tracking-wider text-rapid-text-muted">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Nombre</th>
                <th className="text-left font-semibold px-5 py-3">Rol</th>
                <th className="text-right font-semibold px-5 py-3">Tarifa/pieza</th>
                <th className="text-center font-semibold px-5 py-3">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((emp) => (
                <tr key={emp.Id} className="border-t border-rapid-border hover:bg-rapid-bg/30">
                  <td className="px-5 py-3 font-medium">
                    {emp.Name}
                    {emp.IsExternal && (
                      <span className="ml-2 text-xs text-rapid-text-muted">(externo)</span>
                    )}
                  </td>
                  <td className="px-5 py-3">{emp.Role}</td>
                  <td className="px-5 py-3 text-right font-mono">
                    {formatMoney(toPlainNumber(emp.DefaultUnitPrice) ?? 0)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        emp.IsActive
                          ? "bg-rapid-green-soft text-rapid-green-dark"
                          : "bg-rapid-bg text-rapid-text-muted"
                      }`}
                    >
                      {emp.IsActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/employees/${emp.Id}`}
                      className="text-xs font-semibold text-rapid-green-dark hover:underline"
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
