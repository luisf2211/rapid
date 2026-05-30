import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getActiveInvoiceForWorkOrder,
  listWorkOrdersReadyToInvoice,
} from "@/services/invoices.service";
import { NewInvoiceForm } from "./NewInvoiceForm";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ workOrderId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  const { workOrderId: woParam } = await searchParams;
  const initialId = woParam ? Number(woParam) : undefined;

  if (initialId && Number.isFinite(initialId)) {
    const existing = await getActiveInvoiceForWorkOrder(initialId);
    if (existing) {
      redirect(`/invoices/${existing.id}`);
    }
  }

  let workOrders: Awaited<ReturnType<typeof listWorkOrdersReadyToInvoice>> = [];
  try {
    workOrders = await listWorkOrdersReadyToInvoice();
  } catch {
    workOrders = [];
  }

  return (
    <>
      <PageHeader
        title="Nueva factura"
        subtitle="Selecciona la orden de recepción a facturar."
        actions={
          <Link href="/invoices" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <NewInvoiceForm
        workOrders={workOrders}
        initialWorkOrderId={
          initialId && Number.isFinite(initialId) ? initialId : undefined
        }
      />
    </>
  );
}
