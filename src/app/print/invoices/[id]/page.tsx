import "@/app/print/invoice-print.css";
import { notFound } from "next/navigation";
import { getInvoiceForPrint } from "@/services/invoices.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildInvoicePrintData } from "@/lib/invoice/print-data";
import { InvoiceDocument } from "@/components/invoice/print/InvoiceDocument";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

export default async function InvoicePrintPage({
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

  const invoice = await getInvoiceForPrint(id);
  if (!invoice) notFound();

  const workshop = await getWorkshopPrintInfo();
  const data = buildInvoicePrintData(invoice, workshop);
  const backHref = `/invoices/${id}`;
  const autoPrint = auto === "1";
  const brandColor = workshop.brandColor ?? "#c41e3a";

  return (
    <>
      <PrintToolbar backHref={backHref} autoPrint={autoPrint} />
      <div style={{ padding: "16px", "--brand-color": brandColor } as React.CSSProperties}>
        <InvoiceDocument data={data} workshop={workshop} />
      </div>
    </>
  );
}
