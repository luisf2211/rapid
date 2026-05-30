import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  canEditInvoice,
  getInvoiceById,
} from "@/services/invoices.service";
import { invoiceToFormValues } from "@/lib/invoice/form-mapper";
import { EditInvoiceForm } from "./EditInvoiceForm";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  if (!canEditInvoice(invoice.status)) {
    return (
      <>
        <PageHeader
          title={`Factura FAC-${String(invoice.invoiceNumber).padStart(5, "0")}`}
          subtitle="No se puede editar"
        />
        <div className="card p-5 text-sm">
          <p className="text-rapid-text-muted">
            Las facturas pagadas o anuladas no se pueden modificar. Puedes
            consultarlas e imprimirlas.
          </p>
          <Link href={`/invoices/${id}`} className="btn-primary inline-flex mt-4">
            Ver factura
          </Link>
        </div>
      </>
    );
  }

  const initialValues = invoiceToFormValues(invoice);

  return (
    <>
      <Link
        href={`/invoices/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-rapid-text-muted hover:text-rapid-text mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        FAC-{String(invoice.invoiceNumber).padStart(5, "0")}
      </Link>
      <PageHeader
        title="Editar factura"
        subtitle={invoice.customerName}
      />
      <EditInvoiceForm
        initialValues={initialValues}
        orderNumber={invoice.workOrder.orderNumber}
      />
    </>
  );
}
