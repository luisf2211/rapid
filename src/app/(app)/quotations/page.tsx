import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listQuotations } from "@/services/quotations.service";
import { QuotationsTable } from "@/components/quotation/QuotationsTable";
import { toPlainNumber } from "@/lib/serialize";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function QuotationsPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams;

  let quotations: Awaited<ReturnType<typeof listQuotations>> = [];
  let error: string | null = null;
  try {
    quotations = await listQuotations({ search: q, status });
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const tableItems = quotations.map((item) => ({
    id: item.id,
    quotationNumber: item.quotationNumber,
    customerName: item.customerName,
    brand: item.brand,
    model: item.model,
    plate: item.plate,
    quotationType: item.quotationType,
    status: item.status,
    grandTotal: toPlainNumber(item.grandTotal) ?? 0,
    workOrderId: item.workOrderId,
  }));

  return (
    <>
      <PageHeader
        title="Cotizaciones"
        subtitle="Presupuestos antes de recibir el vehículo en el taller."
        actions={
          <Link href="/quotations/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nueva
          </Link>
        }
      />

      <form
        method="get"
        className="card p-3 mb-4 flex flex-col sm:flex-row gap-2 sm:items-center"
      >
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rapid-text-muted"
            aria-hidden
          />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cliente, placa o número..."
            className="form-input w-full pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="form-input sm:w-36"
        >
          <option value="">Todos</option>
          <option value="DRAFT">Borrador</option>
          <option value="PENDING">Pendiente</option>
          <option value="APPROVED">Aprobada</option>
          <option value="REJECTED">Rechazada</option>
          <option value="CONVERTED">Convertida</option>
        </select>
        <button type="submit" className="btn-dark">
          Buscar
        </button>
      </form>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          No se pudo cargar el listado.
        </div>
      )}

      {!error && quotations.length === 0 && (
        <div className="card p-12 text-center">
          <FileText className="w-10 h-10 mx-auto text-rapid-text-muted-soft mb-3" />
          <p className="text-sm font-medium text-rapid-text">No hay cotizaciones</p>
          <Link href="/quotations/new" className="btn-primary inline-flex mt-4">
            <Plus className="w-4 h-4" />
            Crear la primera
          </Link>
        </div>
      )}

      {!error && quotations.length > 0 && <QuotationsTable items={tableItems} />}
    </>
  );
}
