import type { EmployeePaymentPrintData } from "@/lib/payments/print-data";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { InvoicePrintFooter } from "@/components/invoice/print/InvoicePrintFooter";
import { PrintWorkshopReceiverSignature } from "@/components/print/PrintWorkshopReceiverSignature";

export function EmployeePaymentDocument({
  data,
  workshop,
}: {
  data: EmployeePaymentPrintData;
  workshop: WorkshopPrintInfo;
}) {
  return (
    <article className="idoc">
      <header className="idoc-header">
        <div className="idoc-logo-block">
          {workshop.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={workshop.logoUrl} alt="" className="idoc-logo-img" />
          ) : (
            <div className="idoc-logo-mark">R</div>
          )}
          <div>
            <div className="idoc-brand-name">{workshop.businessName}</div>
            <div className="idoc-brand-tag">{workshop.tagline}</div>
          </div>
        </div>
        <div className="idoc-doc-meta">
          <div className="idoc-doc-title">{data.docTitle}</div>
          <div className="idoc-doc-number">No. {data.docNumber}</div>
          <div className="idoc-meta-line">Fecha: {data.paymentDate}</div>
        </div>
      </header>

      <div className="idoc-box" style={{ marginBottom: 16 }}>
        <p>
          <strong>Empleado:</strong> {data.employeeName}
        </p>
        <p>
          <strong>Rol:</strong> {data.employeeRole}
        </p>
        <p>
          <strong>ID:</strong> {data.nationalId}
        </p>
        {data.periodLabel && (
          <p>
            <strong>Período:</strong> {data.periodLabel}
          </p>
        )}
      </div>

      {data.lines && data.lines.length > 0 && (
        <>
          {data.workSectionTitle && (
            <p className="idoc-section-title" style={{ marginBottom: 8 }}>
              {data.workSectionTitle}
            </p>
          )}
          <table className="idoc-table">
          <thead>
            <tr>
              <th>Detalle</th>
              <th className="num">Cant.</th>
              <th className="num">Precio</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((line, i) => (
              <tr key={i}>
                <td>{line.description}</td>
                <td className="num">{line.quantity}</td>
                <td className="num">{line.unitPrice}</td>
                <td className="num">{line.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      )}

      {data.gross && (
        <div className="idoc-totals" style={{ marginTop: 16 }}>
          <div className="idoc-total-row">
            <span>Bruto</span>
            <span>{data.gross}</span>
          </div>
          <div className="idoc-total-row">
            <span>Anticipos descontados</span>
            <span>−{data.advances}</span>
          </div>
          {data.adjustments && Number(data.adjustments.replace(/[^0-9.-]/g, "")) !== 0 && (
            <div className="idoc-total-row">
              <span>Ajustes</span>
              <span>{data.adjustments}</span>
            </div>
          )}
          <div className="idoc-total-row" style={{ fontWeight: 700 }}>
            <span>Neto pagado</span>
            <span>{data.net ?? data.amount}</span>
          </div>
        </div>
      )}

      {!data.gross && (
        <div className="idoc-totals" style={{ marginTop: 16 }}>
          <div className="idoc-total-row" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            <span>Monto anticipo</span>
            <span>{data.amount}</span>
          </div>
        </div>
      )}

      <div className="idoc-box" style={{ marginTop: 16, fontSize: "0.85rem" }}>
        <p>
          <strong>Forma de pago:</strong> {data.paymentMethod}
        </p>
        <p>
          <strong>Referencia:</strong> {data.reference}
        </p>
        {data.notes && (
          <p>
            <strong>Notas:</strong> {data.notes}
          </p>
        )}
        <p>
          <strong>Entregado por:</strong> {data.paidBy}
        </p>
      </div>

      <div className="idoc-signatures">
        <div className="idoc-sig-block">
          <div className="idoc-sig-line" />
          <div className="idoc-sig-label">Firma empleado</div>
        </div>
        <PrintWorkshopReceiverSignature workshop={workshop} label="Firma taller" />
      </div>

      <InvoicePrintFooter workshop={workshop} />
    </article>
  );
}
