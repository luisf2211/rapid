import "@/app/print/thermal-ticket.css";
import { notFound } from "next/navigation";
import { getInvoicePaymentById, getInvoiceBalance } from "@/services/invoice-payments.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { PaymentReceiptTicket } from "@/components/invoice/print/PaymentReceiptTicket";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

export default async function PaymentReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const { id: idParam } = await params;
  const { auto } = await searchParams;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const payment = await getInvoicePaymentById(id);
  if (!payment) notFound();

  const workshop = await getWorkshopPrintInfo();
  const balance = await getInvoiceBalance(payment.InvoiceId);
  const autoPrint = auto === "1";

  return (
    <>
      <PrintToolbar
        backHref={`/invoices/${payment.InvoiceId}`}
        backLabel="Volver"
        autoPrint={autoPrint}
      />
      <PaymentReceiptTicket
        payment={payment}
        balance={balance}
        workshop={workshop}
      />
    </>
  );
}
