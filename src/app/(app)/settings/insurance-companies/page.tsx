import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listInsuranceCompanies } from "@/services/insurance-companies.service";
import { InsuranceCompaniesClient } from "./InsuranceCompaniesClient";

export const dynamic = "force-dynamic";

export default async function InsuranceCompaniesPage() {
  let companies: Awaited<ReturnType<typeof listInsuranceCompanies>> = [];
  let error: string | null = null;
  try {
    companies = await listInsuranceCompanies();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Aseguradoras"
        subtitle="Gestiona las compañías de seguros para cotizaciones."
      />

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <InsuranceCompaniesClient companies={companies} />
    </>
  );
}
