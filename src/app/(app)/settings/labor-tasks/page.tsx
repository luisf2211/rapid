import { PageHeader } from "@/components/ui/PageHeader";
import { listQuotationTaskTypes } from "@/services/quotation-task-types.service";
import { LaborTasksClient } from "./LaborTasksClient";

export const dynamic = "force-dynamic";

export default async function LaborTasksPage() {
  let tasks: Awaited<ReturnType<typeof listQuotationTaskTypes>> = [];
  let error: string | null = null;
  try {
    tasks = await listQuotationTaskTypes();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Tareas de mano de obra"
        subtitle="Personaliza las tareas disponibles al cotizar."
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <LaborTasksClient
        tasks={tasks.map((t) => ({ Id: t.Id, Name: t.Name, IsActive: t.IsActive }))}
      />
    </>
  );
}
