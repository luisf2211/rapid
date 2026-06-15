import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { getEmployeeById, employeeToFormValues } from "@/services/employees.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: PageProps) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const emp = await getEmployeeById(id);
  if (!emp) notFound();

  return (
    <>
      <PageHeader
        title={`Editar — ${emp.Name}`}
        actions={
          <Link href={`/employees/${id}`} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <EmployeeForm
        mode="edit"
        employeeId={id}
        cancelHref={`/employees/${id}`}
        defaultValues={employeeToFormValues(emp)}
      />
    </>
  );
}
