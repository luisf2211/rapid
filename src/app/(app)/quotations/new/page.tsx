import { PageHeader } from "@/components/ui/PageHeader";
import { listInventoryParts } from "@/services/inventory.service";
import { serializeInventoryPartOption } from "@/lib/inventory/client";
import { NewQuotationForm } from "./NewQuotationForm";

export const dynamic = "force-dynamic";

export default async function NewQuotationPage() {
  let inventoryParts: ReturnType<typeof serializeInventoryPartOption>[] = [];
  let inventoryError: string | null = null;

  try {
    const parts = await listInventoryParts({ filter: "all" });
    inventoryParts = parts
      .filter((p) => p.isActive)
      .map(serializeInventoryPartOption);
  } catch (e) {
    inventoryError = e instanceof Error ? e.message : "Inventario no disponible";
  }

  return (
    <div className="max-w-4xl pb-8">
      <PageHeader title="Nueva cotización" subtitle="Completa los datos del cliente y el trabajo." />
      {inventoryError && (
        <div className="card border-amber-200 bg-amber-50 p-3 mb-4 text-sm text-amber-800">
          Inventario no cargado: puedes escribir materiales manualmente.
        </div>
      )}
      <NewQuotationForm inventoryParts={inventoryParts} />
    </div>
  );
}
