import { formatMoney } from "@/lib/formatters/money";
import { PAYMENT_METHODS } from "@/lib/validations/invoice-payment";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { toPlainNumber } from "@/lib/serialize";

function methodLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

interface PaymentData {
  Id: number;
  InvoiceId: number;
  PaymentNumber: number;
  Amount: unknown;
  PaymentMethod: string;
  BankName: string | null;
  Reference: string | null;
  Concept: string | null;
  ReceivedBy: string | null;
  DeliveredBy: string | null;
  PaymentDate: Date;
  Notes: string | null;
  invoice: {
    id: number;
    invoiceNumber: number;
    customerName: string;
    grandTotal: unknown;
    plate: string | null;
    brand: string | null;
    model: string | null;
  };
}

interface Props {
  payment: PaymentData;
  balance: { grandTotal: number; totalPaid: number; balance: number };
  workshop: WorkshopPrintInfo;
}

/**
 * Recibo de pago (ticket térmico 80mm) para abonos a factura.
 */
export function PaymentReceiptTicket({ payment, balance, workshop }: Props) {
  const amount = toPlainNumber(payment.Amount) ?? 0;
  const inv = payment.invoice;

  return (
    <div className="ticket">
      {/* Header */}
      <div className="ticket-header">
        <div className="ticket-header-name">{workshop.businessName}</div>
        {workshop.phone && <div className="ticket-header-sub">{workshop.phone}</div>}
      </div>

      {/* Title */}
      <div className="ticket-title">
        RECIBO DE PAGO
        <br />
        Abono #{payment.PaymentNumber}
      </div>

      {/* Meta */}
      <div className="ticket-meta">
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Factura:</span>
          <span>FAC-{String(inv.invoiceNumber).padStart(5, "0")}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Fecha:</span>
          <span>{new Date(payment.PaymentDate).toLocaleDateString("es-DO")}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Cliente:</span>
          <span>{inv.customerName}</span>
        </div>
        {inv.plate && (
          <div className="ticket-meta-row">
            <span className="ticket-meta-label">Vehiculo:</span>
            <span>{[inv.brand, inv.model, inv.plate].filter(Boolean).join(" ")}</span>
          </div>
        )}
      </div>

      <hr className="ticket-separator" />

      {/* Payment details */}
      <div className="ticket-meta">
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Metodo:</span>
          <span>{methodLabel(payment.PaymentMethod)}</span>
        </div>
        {payment.BankName && (
          <div className="ticket-meta-row">
            <span className="ticket-meta-label">Banco:</span>
            <span>{payment.BankName}</span>
          </div>
        )}
        {payment.Reference && (
          <div className="ticket-meta-row">
            <span className="ticket-meta-label">Referencia:</span>
            <span>{payment.Reference}</span>
          </div>
        )}
        {payment.Concept && (
          <div className="ticket-meta-row">
            <span className="ticket-meta-label">Concepto:</span>
            <span>{payment.Concept}</span>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="ticket-total">
        <div className="ticket-total-row ticket-total-grand">
          <span>ABONO:</span>
          <span>{formatMoney(amount)}</span>
        </div>
      </div>

      <hr className="ticket-separator" />

      {/* Balance summary */}
      <div className="ticket-meta">
        <div className="ticket-meta-row">
          <span>Total factura:</span>
          <span>{formatMoney(balance.grandTotal)}</span>
        </div>
        <div className="ticket-meta-row">
          <span>Total pagado:</span>
          <span>{formatMoney(balance.totalPaid)}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Saldo pendiente:</span>
          <span className="ticket-meta-label">{formatMoney(balance.balance)}</span>
        </div>
      </div>

      {/* Signatures */}
      <div className="ticket-sig">
        <div className="ticket-sig-line">
          {payment.ReceivedBy ? `Recibido: ${payment.ReceivedBy}` : "Recibido por"}
        </div>
      </div>
      {payment.DeliveredBy && (
        <div className="ticket-sig" style={{ marginTop: "3mm" }}>
          <div className="ticket-sig-line">Entregado: {payment.DeliveredBy}</div>
        </div>
      )}

      {/* Footer */}
      <div className="ticket-footer">
        <hr className="ticket-separator" />
        Gracias por su pago.
      </div>
    </div>
  );
}
