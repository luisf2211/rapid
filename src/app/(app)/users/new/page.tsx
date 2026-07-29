import { PageHeader } from "@/components/ui/PageHeader";
import { UserForm } from "@/components/users/UserForm";

export default function NewUserPage() {
  return (
    <>
      <PageHeader
        title="Nuevo usuario"
        subtitle="Crea un usuario para que acceda al sistema con los permisos que asignes."
      />
      <UserForm mode="create" />
    </>
  );
}
