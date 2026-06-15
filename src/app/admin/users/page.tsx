import { listCompanies, listUsers } from "@/services/auth.service";
import { USER_ROLE_LABELS } from "@/lib/auth/constants";
import { CreateUserForm } from "./CreateUserForm";
import { UserRowActions } from "./UserRowActions";

export default async function AdminUsersPage() {
  const [companies, users] = await Promise.all([
    listCompanies(),
    listUsers(),
  ]);

  const companyOptions = companies
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-rapid-text-muted mt-1">
          Usuarios que acceden al taller con correo y contraseña.
        </p>
      </div>

      <CreateUserForm companies={companyOptions} />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-rapid-bg/60 text-xs uppercase text-rapid-text-muted">
            <tr>
              <th className="text-left px-5 py-3">Correo</th>
              <th className="text-left px-5 py-3">Nombre</th>
              <th className="text-left px-5 py-3">Empresa</th>
              <th className="text-left px-5 py-3">Rol</th>
              <th className="text-left px-5 py-3">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-rapid-border">
                <td className="px-5 py-3 font-mono text-xs">{u.email}</td>
                <td className="px-5 py-3">{u.fullName ?? "—"}</td>
                <td className="px-5 py-3">{u.company?.name ?? "Plataforma"}</td>
                <td className="px-5 py-3">
                  {USER_ROLE_LABELS[u.role as keyof typeof USER_ROLE_LABELS] ??
                    u.role}
                </td>
                <td className="px-5 py-3">
                  {u.isActive ? (
                    <span className="text-rapid-green-dark font-semibold">Activo</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactivo</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {u.role !== "PLATFORM_ADMIN" && (
                    <UserRowActions id={u.id} isActive={u.isActive} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
