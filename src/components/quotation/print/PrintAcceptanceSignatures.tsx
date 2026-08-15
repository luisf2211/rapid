import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { PrintQuotationWorkshopSignature } from "@/components/print/PrintWorkshopReceiverSignature";

export function PrintAcceptanceSignatures({
  customerName,
  showInsuranceApproval = false,
  workshop,
}: {
  customerName: string;
  showInsuranceApproval?: boolean;
  workshop?: WorkshopPrintInfo;
}) {
  if (!workshop) return null;

  return (
    <section className="qdoc-signatures-block">
      <h3 className="qdoc-section-title">Conformidad</h3>
      <div className="qdoc-signatures">
        <div className="qdoc-sig-cell">
          <div className="qdoc-sig-space" aria-hidden />
          <p className="qdoc-sig-label">Firma del cliente</p>
        </div>
        <PrintQuotationWorkshopSignature workshop={workshop} />
      </div>
      <p className="qdoc-sig-date">Fecha: _____ / _____ / ________</p>

      {showInsuranceApproval && (
        <div className="qdoc-sig-insurance">
          <div className="qdoc-sig-space qdoc-sig-space--sm" aria-hidden />
          <p className="qdoc-sig-label">Vo. Bo. aseguradora / ajustador</p>
        </div>
      )}
    </section>
  );
}
