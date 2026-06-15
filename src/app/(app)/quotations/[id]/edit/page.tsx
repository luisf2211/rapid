import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getQuotationById } from "@/services/quotations.service";
import { quotationToFormValues } from "@/lib/quotation/form-mapper";
import { NewQuotationForm } from "../../new/NewQuotationForm";

export const dynamic = "force-dynamic";

function safeReturnPath(value: string | undefined): string | null {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;
  if (
    !value.startsWith("/work-orders/") &&
    !value.startsWith("/quotations/")
  ) {
    return null;
  }
  return value;
}

export default async function EditQuotationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id: idParam } = await params;
  const { returnTo } = await searchParams;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const quotation = await getQuotationById(id);
  if (!quotation) notFound();

  const initialValues = quotationToFormValues(quotation);
  const returnPath = safeReturnPath(returnTo);
  const backHref = returnPath ?? `/quotations/${id}`;

  return (
    <div className="max-w-4xl pb-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-rapid-text-muted hover:text-rapid-text mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {returnPath ? "Volver a recepción" : `Cotización #${quotation.quotationNumber}`}
      </Link>
      <PageHeader
        title="Editar cotización"
        subtitle={quotation.customerName}
      />
      <NewQuotationForm
        quotationId={id}
        initialValues={initialValues}
        currentStatus={quotation.status}
        cancelHref={backHref}
        successHref={backHref}
      />
    </div>
  );
}
