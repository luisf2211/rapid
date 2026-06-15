import type { ReactNode } from "react";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { PrintStamp } from "@/components/print/PrintStamp";

function PrintSignatureWatermarkBlock({
  workshop,
  label,
  labelClassName,
  subtitle,
  wrapperClassName,
}: {
  workshop: WorkshopPrintInfo;
  label: string;
  labelClassName: string;
  subtitle?: ReactNode;
  wrapperClassName?: string;
}) {
  return (
    <div className={`print-sig-watermark-block ${wrapperClassName ?? ""}`.trim()}>
      <PrintStamp workshop={workshop} className="print-stamp print-stamp--watermark" />
      <div className="print-sig-watermark-line" aria-hidden />
      <p className={labelClassName}>{label}</p>
      {subtitle}
    </div>
  );
}

/** Bloque de firma del taller con sello digital (estilo factura / orden). */
export function PrintWorkshopReceiverSignature({
  workshop,
  label = "Recibido por (taller)",
  subtitle,
}: {
  workshop: WorkshopPrintInfo;
  label?: string;
  subtitle?: ReactNode;
}) {
  return (
    <div className="idoc-sig-block idoc-sig-block--workshop">
      <PrintSignatureWatermarkBlock
        workshop={workshop}
        label={label}
        labelClassName="idoc-sig-label"
        subtitle={subtitle}
      />
    </div>
  );
}

/** Celda de firma del taller en cotizaciones (estilo qdoc). */
export function PrintQuotationWorkshopSignature({
  workshop,
  label = "Recibido por (taller)",
}: {
  workshop: WorkshopPrintInfo;
  label?: string;
}) {
  return (
    <div className="qdoc-sig-cell qdoc-sig-cell--workshop">
      <PrintSignatureWatermarkBlock
        workshop={workshop}
        label={label}
        labelClassName="qdoc-sig-label"
      />
    </div>
  );
}
