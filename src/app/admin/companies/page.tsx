import { listCompanies } from "@/services/auth.service";
import { CreateCompanyForm } from "./CreateCompanyForm";
import { CompanyRowActions } from "./CompanyRowActions";

export default async function AdminCompaniesPage() {
  const companies = await listCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-sm text-rapid-text-muted mt-1">
          Cada empresa tiene su propio inventario, órdenes y usuarios.
        </p>
      </div>

      <CreateCompanyForm />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-rapid-bg/60 text-xs uppercase text-rapid-text-muted">
            <tr>
              <th className="text-left px-5 py-3">Nombre</th>
              <th className="text-left px-5 py-3">Slug</th>
              <th className="text-right px-5 py-3">Usuarios</th>
              <th className="text-right px-5 py-3">Órdenes</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-t border-rapid-border">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 font-mono text-xs">{c.slug}</td>
                <td className="px-5 py-3 text-right">{c._count.users}</td>
                <td className="px-5 py-3 text-right">{c._count.workOrders}</td>
                <td className="px-5 py-3">
                  {c.isActive ? (
                    <span className="text-rapid-green-dark font-semibold">Activa</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactiva</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <CompanyRowActions id={c.id} isActive={c.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
