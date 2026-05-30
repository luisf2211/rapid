import Link from "next/link";
import { Plus, Search, Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listInvoices } from "@/services/invoices.service";
import { InvoicesTable } from "@/components/invoice/InvoicesTable";
import { toPlainNumber } from "@/lib/serialize";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams;

  let invoices: Awaited<ReturnType<typeof listInvoices>> = [];
  let error: string | null = null;
  try {
    invoices = await listInvoices({ search: q, status });
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const tableItems = invoices.map((item) => ({
    id: item.id,
    invoiceNumber: item.invoiceNumber,
    invoiceDate: item.invoiceDate,
    customerName: item.customerName,
    plate: item.plate,
    billingType: item.billingType,
    status: item.status,
    grandTotal: toPlainNumber(item.grandTotal) ?? 0,
    workOrderId: item.workOrderId,
    orderNumber: item.workOrder.orderNumber,
  }));

  return (
    <>
      <PageHeader
        title="Facturación"
        subtitle="Último paso: factura a partir de mano de obra y materiales de la orden."
        actions={
          <Link href="/invoices/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nueva factura
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
            className="form-input w-full pl-10"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="form-input sm:w-40"
        >
          <option value="">Todos</option>
          {Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-dark sm:px-5">
          Buscar
        </button>
      </form>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          No se pudo cargar el listado. Ejecuta el script SQL 004 y reinicia el
          servidor (<code className="text-xs">npx prisma generate</code>).
        </div>
      )}

      {!error && invoices.length === 0 && (
        <div className="card p-12 text-center">
          <Receipt className="w-10 h-10 mx-auto text-rapid-text-muted/50 mb-3" />
          <p className="font-medium text-rapid-text">No hay facturas</p>
          <Link href="/invoices/new" className="btn-primary inline-flex mt-4">
            <Plus className="w-4 h-4" />
            Generar la primera
          </Link>
        </div>
      )}

      {!error && invoices.length > 0 && <InvoicesTable items={tableItems} />}
    </>
  );
}
