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

export function InsuranceQuotationDocument({
  data,
  workshop,
}: {
  data: QuotationPrintData;
  workshop: WorkshopPrintInfo;
}) {
  return (
    <article className="qdoc">
      <PrintDocumentHeader data={data} workshop={workshop} />

      <div className="qdoc-grid-2">
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
            {field("Kilometraje", data.mileage)}
          </div>
          <h3 className="qdoc-section-title" style={{ marginTop: 10 }}>
            Cliente / propietario
          </h3>
          <div className="qdoc-box">
            {field("Nombre", data.customerName)}
            {field("Teléfono", data.phone)}
          </div>
        </div>
        <div>
          <h3 className="qdoc-section-title">Datos del siniestro</h3>
          <div className="qdoc-box">
            {field("Aseguradora", data.insuranceCompany)}
            {field("RNC aseguradora", data.insurerRnc)}
            {field("No. de póliza", data.policyNumber)}
            {field("No. de reclamo", data.claimNumber)}
            {field("Ajustador", data.adjusterName)}
            {field("Tel. ajustador", data.adjusterPhone)}
            {data.deductibleAmount != null && data.deductibleAmount > 0 && (
              <div className="qdoc-field">
                <strong>Deducible:</strong> {formatMoney(data.deductibleAmount)}
              </div>
            )}
            {field("Fecha de inspección", data.quotationDate)}
          </div>
        </div>
      </div>

      <PrintQuotationDetailSections data={data} />

      <h3 className="qdoc-section-title">Resumen del presupuesto</h3>
      <div className="qdoc-summary-box">
        <table>
          <tbody>
            <tr>
              <td>Partes a trabajar</td>
              <td>{formatMoney(data.laborSubtotal)}</td>
            </tr>
            <tr>
              <td>Piezas a sustituir</td>
              <td>{formatMoney(data.partsSubtotal)}</td>
            </tr>
            {data.discountAmount > 0 && (
              <tr>
                <td>Descuento</td>
                <td>-{formatMoney(data.discountAmount)}</td>
              </tr>
            )}
            <tr>
              <td>Subtotal</td>
              <td>
                {formatMoney(
                  data.laborSubtotal +
                    data.partsSubtotal -
                    data.discountAmount,
                )}
              </td>
            </tr>
            <tr>
              <td>ITBIS ({Math.round(data.taxRate * 100)}%)</td>
              <td>{formatMoney(data.taxAmount)}</td>
            </tr>
            <tr>
              <td>
                <strong className="qdoc-red" style={{ fontSize: "11pt" }}>
                  TOTAL PRESUPUESTO
                </strong>
              </td>
              <td>
                <strong className="qdoc-red" style={{ fontSize: "11pt" }}>
                  {formatMoney(data.grandTotal)}
                </strong>
              </td>
            </tr>
            {data.deductibleAmount != null && data.deductibleAmount > 0 && (
              <>
                <tr>
                  <td>Deducible (cliente)</td>
                  <td>{formatMoney(data.deductibleAmount)}</td>
                </tr>
                <tr>
                  <td>A cargo de aseguradora</td>
                  <td>
                    {formatMoney(
                      Math.max(0, data.grandTotal - data.deductibleAmount),
                    )}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <PrintAcceptanceSignatures
        customerName={data.customerName}
        showInsuranceApproval
        workshop={workshop}
      />

      <PrintFooter workshop={workshop} />
    </article>
  );
}
