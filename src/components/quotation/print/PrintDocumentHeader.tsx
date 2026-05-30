import type { QuotationPrintData } from "@/lib/quotation/print-data";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";

export function PrintDocumentHeader({
  data,
  workshop,
}: {
  data: QuotationPrintData;
  workshop: WorkshopPrintInfo;
}) {
  return (
    <header className="qdoc-header">
      <div className="qdoc-logo-block">
        {workshop.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={workshop.logoUrl} alt="" className="qdoc-logo-img" />
        ) : (
          <div className="qdoc-logo-mark">R</div>
        )}
        <div>
          <div className="qdoc-brand-name">{workshop.businessName}</div>
          <div className="qdoc-brand-tag">{workshop.tagline}</div>
          <div className="qdoc-company-meta">
            {workshop.legalName && <div>{workshop.legalName}</div>}
            {workshop.rnc && <div>RNC: {workshop.rnc}</div>}
            {workshop.address && <div>{workshop.address}</div>}
            <div>
              {[workshop.phone, workshop.email].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
      </div>
      <div className="qdoc-doc-meta">
        <div className="qdoc-doc-title">{data.docTitle}</div>
        <div className="qdoc-doc-number">No. {data.docNumber}</div>
        <div className="qdoc-meta-line">Fecha: {data.quotationDate}</div>
        {data.validUntil && (
          <div className="qdoc-meta-line">Válida hasta: {data.validUntil}</div>
        )}
        {!data.validUntil && (
          <div className="qdoc-meta-line">Válida por: 15 días</div>
        )}
      </div>
    </header>
  );
}
