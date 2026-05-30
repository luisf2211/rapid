import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getQuotationById } from "@/services/quotations.service";
import { listInventoryParts } from "@/services/inventory.service";
import { serializeInventoryPartOption } from "@/lib/inventory/client";
import {
  canEditQuotation,
  quotationToFormValues,
} from "@/lib/quotation/form-mapper";
import { NewQuotationForm } from "../../new/NewQuotationForm";

export const dynamic = "force-dynamic";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const quotation = await getQuotationById(id);
  if (!quotation) notFound();

  if (!canEditQuotation(quotation.status)) {
    return (
      <>
        <PageHeader
          title={`Cotización #${quotation.quotationNumber}`}
          subtitle="No se puede editar"
        />
        <div className="card p-5 text-sm">
          <p className="text-rapid-text-muted">
            Esta cotización ya fue convertida a orden de recepción. Solo puedes
            consultarla e imprimirla.
          </p>
          <Link
            href={`/quotations/${id}`}
            className="btn-primary inline-flex mt-4"
          >
            Ver cotización
          </Link>
        </div>
      </>
    );
  }

  let inventoryParts: ReturnType<typeof serializeInventoryPartOption>[] = [];
  try {
    const parts = await listInventoryParts({ filter: "all" });
    inventoryParts = parts
      .filter((p) => p.isActive)
      .map(serializeInventoryPartOption);
  } catch {
    /* inventario opcional */
  }

  const initialValues = quotationToFormValues(quotation);

  return (
    <div className="max-w-4xl pb-8">
      <Link
        href={`/quotations/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-rapid-text-muted hover:text-rapid-text mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Cotización #{quotation.quotationNumber}
      </Link>
      <PageHeader
        title="Editar"
        subtitle={quotation.customerName}
      />
      <NewQuotationForm
        inventoryParts={inventoryParts}
        quotationId={id}
        initialValues={initialValues}
        currentStatus={quotation.status}
        cancelHref={`/quotations/${id}`}
      />
    </div>
  );
}
