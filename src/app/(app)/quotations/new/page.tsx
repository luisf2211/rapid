import { PageHeader } from "@/components/ui/PageHeader";
import { NewQuotationForm } from "./NewQuotationForm";

export const dynamic = "force-dynamic";

export default async function NewQuotationPage() {
  return (
    <div className="max-w-4xl pb-8">
      <PageHeader title="Nueva cotización" subtitle="Completa los datos del cliente y el trabajo." />
      <NewQuotationForm />
    </div>
  );
}
