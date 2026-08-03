import { notFound } from "next/navigation";
import { getQuotationForPrint } from "@/services/quotations.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildQuotationPrintData } from "@/lib/quotation/print-data";
import { PrivateQuotationDocument } from "@/components/quotation/print/PrivateQuotationDocument";
import { InsuranceQuotationDocument } from "@/components/quotation/print/InsuranceQuotationDocument";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

export default async function QuotationPrintPage({
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

  const quotation = await getQuotationForPrint(id);
  if (!quotation) notFound();

  const workshop = await getWorkshopPrintInfo();
  const data = buildQuotationPrintData(quotation, workshop);
  const backHref = `/quotations/${id}`;
  const autoPrint = auto === "1";
  const brandColor = workshop.brandColor ?? "#c41e3a";

  return (
    <>
      <PrintToolbar
        backHref={backHref}
        backLabel="Volver a la cotización"
        autoPrint={autoPrint}
      />
      <div style={{ padding: "16px", "--brand-color": brandColor } as React.CSSProperties}>
        {data.quotationType === "INSURANCE" ? (
          <InsuranceQuotationDocument data={data} workshop={workshop} />
        ) : (
          <PrivateQuotationDocument data={data} workshop={workshop} />
        )}
      </div>
    </>
  );
}
