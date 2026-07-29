import Link from "next/link";
import { Plus, Users, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listCompanyUsers } from "@/services/users.service";
import { USER_ROLE_LABELS } from "@/lib/auth/constants";
import { parsePermissions, SYSTEM_MODULES } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/formatters/date";
import { UsersTable } from "@/components/users/UsersTable";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let users: Awaited<ReturnType<typeof listCompanyUsers>> = [];
  let error: string | null = null;

  try {
    users = await listCompanyUsers();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const tableItems = users.map((u) => {
    const perms = parsePermissions(u.permissions);
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      roleLabel: USER_ROLE_LABELS[u.role as keyof typeof USER_ROLE_LABELS] ?? u.role,
      isActive: u.isActive,
      permissionsCount: perms ? perms.length : null,
      lastLoginAt: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : null,
    };
  });

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Gestiona los usuarios del taller y sus permisos de acceso."
        actions={
          <Link href="/users/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </Link>
        }
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {!error && users.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="w-10 h-10 mx-auto text-rapid-text-muted/50 mb-3" />
          <p className="font-medium text-rapid-text">No hay usuarios registrados</p>
          <Link href="/users/new" className="btn-primary inline-flex mt-4">
            <Plus className="w-4 h-4" />
            Crear primer usuario
          </Link>
        </div>
      )}

      {!error && users.length > 0 && <UsersTable items={tableItems} />}
    </>
  );
}
