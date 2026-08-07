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

/**
 * Documento de cotización para el CLIENTE — solo muestra los trabajos extras
 * que no están cubiertos por la aseguradora.
 */
export function ClientExtrasQuotationDocument({
  data,
  workshop,
}: {
  data: QuotationPrintData;
  workshop: WorkshopPrintInfo;
}) {
  const clientLabor = data.laborRows.filter((l) => l.billingTarget === "CLIENT");
  const clientParts = data.partRows.filter((p) => p.billingTarget === "CLIENT");
  const clientLaborTotal = clientLabor.reduce((s, l) => s + l.total, 0);
  const clientPartsTotal = clientParts.reduce((s, p) => s + p.total, 0);
  const clientTotal = clientLaborTotal + clientPartsTotal;

  return (
    <article className="qdoc">
      <PrintDocumentHeader data={{ ...data, docTitle: "COTIZACIÓN — EXTRAS CLIENTE" }} workshop={workshop} />

      <div className="qdoc-grid-2">
        <div>
          <h3 className="qdoc-section-title">Datos del cliente</h3>
          <div className="qdoc-box">
            {field("Nombre", data.customerName)}
            {field("Teléfono", data.phone)}
            {field("Email", data.email)}
          </div>
        </div>
        <div>
          <h3 className="qdoc-section-title">Datos del vehículo</h3>
          <div className="qdoc-box">
            {field(
              "Marca / Modelo",
              [data.brand, data.model, data.vehicleYear].filter(Boolean).join(" ") || null,
            )}
            {field("Color", data.color)}
            {field("Placa", data.plate)}
          </div>
        </div>
      </div>

      <h3 className="qdoc-section-title">Trabajos extras solicitados por el cliente</h3>
      <PrintQuotationDetailSections data={data} filterBilling="CLIENT" />

      <h3 className="qdoc-section-title">Resumen</h3>
      <div className="qdoc-summary-box">
        <table>
          <tbody>
            {clientLaborTotal > 0 && (
              <tr>
                <td>Mano de obra</td>
                <td>{formatMoney(clientLaborTotal)}</td>
              </tr>
            )}
            {clientPartsTotal > 0 && (
              <tr>
                <td>Repuestos</td>
                <td>{formatMoney(clientPartsTotal)}</td>
              </tr>
            )}
            <tr>
              <td>
                <strong className="qdoc-red" style={{ fontSize: "11pt" }}>
                  TOTAL EXTRAS
                </strong>
              </td>
              <td>
                <strong className="qdoc-red" style={{ fontSize: "11pt" }}>
                  {formatMoney(clientTotal)}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <PrintAcceptanceSignatures
        customerName={data.customerName}
        workshop={workshop}
      />

      <PrintFooter workshop={workshop} />
    </article>
  );
}
