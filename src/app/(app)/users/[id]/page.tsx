import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCompanyUser } from "@/services/users.service";
import { parsePermissions, type ModuleKey } from "@/lib/auth/permissions";
import { UserForm } from "@/components/users/UserForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCompanyUser(Number(id));
  if (!user) notFound();

  const permissions = parsePermissions(user.permissions) ?? [];

  return (
    <>
      <PageHeader
        title={`Editar: ${user.fullName || user.email}`}
        subtitle="Modifica el rol y los permisos de acceso del usuario."
      />
      <UserForm
        mode="edit"
        userId={user.id}
        defaultValues={{
          email: user.email,
          fullName: user.fullName ?? "",
          role: user.role as "COMPANY_ADMIN" | "COMPANY_USER",
          permissions: permissions as ModuleKey[],
          isActive: user.isActive,
        }}
      />
    </>
  );
}
