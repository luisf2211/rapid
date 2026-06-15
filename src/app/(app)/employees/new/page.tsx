import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmployeeForm } from "@/components/employee/EmployeeForm";

export default function NewEmployeePage() {
  return (
    <>
      <PageHeader
        title="Nuevo empleado"
        subtitle="Registra un técnico con rol y tarifa por pieza."
        actions={
          <Link href="/employees" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <EmployeeForm
        mode="create"
        cancelHref="/employees"
        defaultValues={{
          name: "",
          role: "Pintor",
          phone: "",
          nationalId: "",
          defaultUnitPrice: 0,
          isExternal: false,
          isActive: true,
          hiredAt: "",
          notes: "",
        }}
      />
    </>
  );
}
