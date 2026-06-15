import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewAdvanceForm } from "@/components/payments/NewAdvanceForm";
import { listActiveEmployeesForPicker } from "@/services/employees.service";
import { mapEmployeesForSelect } from "@/lib/employee/picker";
import { getWorkshopTodayDateInput } from "@/lib/formatters/today";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ employeeId?: string }>;
}

export default async function NewAdvancePage({ searchParams }: PageProps) {
  const { employeeId } = await searchParams;
  const initialId = employeeId ? Number(employeeId) : undefined;

  let employees: Awaited<ReturnType<typeof listActiveEmployeesForPicker>> = [];
  try {
    employees = await listActiveEmployeesForPicker();
  } catch {
    employees = [];
  }

  return (
    <>
      <PageHeader
        title="Anticipo de efectivo"
        subtitle="Registra un avance descontable en la próxima quincena."
        actions={
          <Link href="/payments" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />

      {employees.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-rapid-text-muted mb-3">
            Registra empleados antes de crear anticipos.
          </p>
          <Link href="/employees/new" className="btn-primary inline-flex">
            Nuevo empleado
          </Link>
        </div>
      ) : (
        <NewAdvanceForm
          employees={mapEmployeesForSelect(employees)}
          initialEmployeeId={
            initialId && Number.isFinite(initialId) ? initialId : undefined
          }
          defaultPaymentDate={getWorkshopTodayDateInput()}
        />
      )}
    </>
  );
}
