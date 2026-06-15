import type { LaborOrderPrintData } from "@/lib/labor-order/print-data";
import { formatMoney } from "@/lib/formatters/money";
import { formatPieceCount } from "@/lib/labor-order/piece-count";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { InvoicePrintFooter } from "@/components/invoice/print/InvoicePrintFooter";
import { PrintWorkshopReceiverSignature } from "@/components/print/PrintWorkshopReceiverSignature";

function field(label: string, value: string | null | undefined) {
  if (!value) return null;
  return (
    <div className="idoc-field">
      <strong>{label}:</strong> {value}
    </div>
  );
}

export function LaborOrderDocument({
  data,
  workshop,
}: {
  data: LaborOrderPrintData;
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
          <div className="idoc-meta-line">Fecha: {data.createdAt}</div>
          <div className="idoc-meta-line">Orden: {data.workOrderNumber}</div>
        </div>
      </header>

      <div className="idoc-grid-2">
        <div>
          <h3 className="idoc-section-title">Técnico</h3>
          <div className="idoc-box">{field("Nombre", data.workerName)}</div>
        </div>
        <div>
          <h3 className="idoc-section-title">Vehículo</h3>
          <div className="idoc-box">
            {field("Cliente", data.customerName)}
            {field("Marca / modelo", data.vehicleLabel)}
            {field("Placa", data.plate)}
          </div>
        </div>
      </div>

      <table className="idoc-table">
        <thead>
          <tr>
            <th>Pieza trabajada</th>
            <th className="num">Cantidad</th>
            <th className="num">Precio/pieza</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((line, i) => (
            <tr key={i}>
              <td>{line.partName}</td>
              <td className="num">{line.quantity}</td>
              <td className="num">{line.unitPrice}</td>
              <td className="num">{line.lineTotal}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="num" style={{ fontWeight: 700 }}>
              Total piezas: {formatPieceCount(data.totalPieces)}
            </td>
            <td className="num" style={{ fontWeight: 700 }}>
              Total a pagar
            </td>
            <td className="num" style={{ fontWeight: 700 }}>
              {formatMoney(data.totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="idoc-signatures">
        <div className="idoc-sig-block">
          <div className="idoc-sig-line" />
          <div className="idoc-sig-label">Firma técnico</div>
        </div>
        <PrintWorkshopReceiverSignature workshop={workshop} />
      </div>

      <InvoicePrintFooter workshop={workshop} />
    </article>
  );
}
