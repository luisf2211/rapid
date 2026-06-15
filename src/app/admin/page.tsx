import Link from "next/link";
import { Building2, Users, Plus } from "lucide-react";
import { listCompanies, listUsers } from "@/services/auth.service";

export default async function AdminHomePage() {
  const [companies, users] = await Promise.all([
    listCompanies(),
    listUsers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administración de plataforma</h1>
        <p className="text-sm text-rapid-text-muted mt-1">
          Da de alta empresas (talleres) y usuarios que accederán al sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rapid-text-muted">Empresas</p>
              <p className="text-3xl font-bold mt-1">{companies.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-rapid-green-dark" />
          </div>
          <Link href="/admin/companies" className="btn-primary mt-4 inline-flex text-sm">
            <Plus className="w-4 h-4" /> Nueva empresa
          </Link>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rapid-text-muted">Usuarios</p>
              <p className="text-3xl font-bold mt-1">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-rapid-green-dark" />
          </div>
          <Link href="/admin/users" className="btn-primary mt-4 inline-flex text-sm">
            <Plus className="w-4 h-4" /> Nuevo usuario
          </Link>
        </div>
      </div>
    </div>
  );
}
