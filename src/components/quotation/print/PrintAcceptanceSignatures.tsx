export function PrintAcceptanceSignatures({
  customerName,
  showInsuranceApproval = false,
}: {
  customerName: string;
  /** Presupuesto aseguradora: línea extra opcional */
  showInsuranceApproval?: boolean;
}) {
  return (
    <section className="qdoc-signatures-block">
      <h3 className="qdoc-section-title">Conformidad</h3>
      <div className="qdoc-signatures">
        <div className="qdoc-sig-cell">
          <div className="qdoc-sig-space" aria-hidden />
          <p className="qdoc-sig-label">Firma del cliente</p>
          <p className="qdoc-sig-name">{customerName}</p>
        </div>
        <div className="qdoc-sig-cell">
          <div className="qdoc-sig-space" aria-hidden />
          <p className="qdoc-sig-label">Recibido por (taller)</p>
          <p className="qdoc-sig-hint">Nombre y firma</p>
        </div>
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
