import { formatMoney } from "@/lib/formatters/money";
import type { QuotationPrintData } from "@/lib/quotation/print-data";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { PrintDocumentHeader } from "./PrintDocumentHeader";
import { PrintFooter } from "./PrintFooter";
import { PrintAcceptanceSignatures } from "./PrintAcceptanceSignatures";
import { PrintQuotationDetailSections } from "./PrintQuotationDetailSections";

function field(label: string, value: string | null | undefined) {
  if (!value) return null;
  return (
    <div className="qdoc-field">
      <strong>{label}:</strong> {value}
    </div>
  );
}

export function PrivateQuotationDocument({
  data,
  workshop,
}: {
  data: QuotationPrintData;
  workshop: WorkshopPrintInfo;
}) {
  const subtotal = data.laborSubtotal + data.partsSubtotal;
  const afterDiscount = Math.max(0, subtotal - data.discountAmount);

  return (
    <article className="qdoc">
      <PrintDocumentHeader data={data} workshop={workshop} />

      <div className="qdoc-grid-2">
        <div>
          <h3 className="qdoc-section-title">Datos del cliente</h3>
          <div className="qdoc-box">
            {field("Nombre", data.customerName)}
            {field("Teléfono", data.phone)}
            {field("Email", data.email)}
            {field("Cédula", data.nationalId)}
            {field("Dirección", data.address)}
          </div>
        </div>
        <div>
          <h3 className="qdoc-section-title">Datos del vehículo</h3>
          <div className="qdoc-box">
            {field(
              "Marca / Modelo",
              [data.brand, data.model, data.vehicleYear].filter(Boolean).join(" ") ||
                null,
            )}
            {field("Color", data.color)}
            {field("Placa", data.plate)}
            {field("VIN", data.vin)}
          </div>
        </div>
      </div>

      <PrintQuotationDetailSections data={data} />

      <h3 className="qdoc-section-title">Condiciones</h3>
      <ul className="qdoc-conditions">
        {data.conditions.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>

      <table className="qdoc-totals">
        <tbody>
          <tr>
            <td>Subtotal</td>
            <td>{formatMoney(afterDiscount)}</td>
          </tr>
          {data.discountAmount > 0 && (
            <tr>
              <td>Descuento</td>
              <td>-{formatMoney(data.discountAmount)}</td>
            </tr>
          )}
          {data.taxAmount > 0 && (
            <tr>
              <td>ITBIS ({Math.round(data.taxRate * 100)}%)</td>
              <td>{formatMoney(data.taxAmount)}</td>
            </tr>
          )}
          <tr className="grand">
            <td>TOTAL</td>
            <td>{formatMoney(data.grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      <PrintAcceptanceSignatures
        customerName={data.customerName}
        workshop={workshop}
      />

      <PrintFooter workshop={workshop} />
    </article>
  );
}
