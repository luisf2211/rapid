import type { LaborOrderPrintData } from "@/lib/labor-order/print-data";
import { formatMoney } from "@/lib/formatters/money";
import { formatPieceCount } from "@/lib/labor-order/piece-count";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";

/**
 * Ticket térmico (80mm) para mano de obra.
 * Formato compacto tipo recibo para impresora térmica/punto.
 */
export function LaborOrderTicket({
  data,
  workshop,
}: {
  data: LaborOrderPrintData;
  workshop: WorkshopPrintInfo;
}) {
  return (
    <div className="ticket">
      {/* Header del taller */}
      <div className="ticket-header">
        <div className="ticket-header-name">{workshop.businessName}</div>
        {workshop.phone && (
          <div className="ticket-header-sub">{workshop.phone}</div>
        )}
      </div>

      {/* Título del documento */}
      <div className="ticket-title">
        {data.docTitle}
        <br />
        {data.docNumber}
      </div>

      {/* Metadatos */}
      <div className="ticket-meta">
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Fecha:</span>
          <span>{data.createdAt}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Orden:</span>
          <span>{data.workOrderNumber}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Cliente:</span>
          <span>{data.customerName}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Vehículo:</span>
          <span>{data.vehicleLabel}</span>
        </div>
        {data.plate && (
          <div className="ticket-meta-row">
            <span className="ticket-meta-label">Placa:</span>
            <span>{data.plate}</span>
          </div>
        )}
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Técnico:</span>
          <span>{data.workerName}</span>
        </div>
      </div>

      <hr className="ticket-separator" />

      {/* Tabla de trabajos */}
      <table className="ticket-items">
        <thead>
          <tr>
            <th>Pieza</th>
            <th className="num">Cant.</th>
            <th className="num">Precio</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((line, i) => (
            <tr key={i}>
              <td className="name">{line.partName}</td>
              <td className="num">{line.quantity}</td>
              <td className="num">{line.unitPrice}</td>
              <td className="num">{line.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="ticket-total">
        <div className="ticket-total-row">
          <span>Piezas:</span>
          <span>{formatPieceCount(data.totalPieces)}</span>
        </div>
        <div className="ticket-total-row ticket-total-grand">
          <span>TOTAL:</span>
          <span>{formatMoney(data.totalAmount)}</span>
        </div>
      </div>

      {/* Firma */}
      <div className="ticket-sig">
        <div className="ticket-sig-line">Firma técnico</div>
      </div>

      {/* Footer */}
      <div className="ticket-footer">
        <hr className="ticket-separator" />
        Gracias por su trabajo.
      </div>
    </div>
  );
}
