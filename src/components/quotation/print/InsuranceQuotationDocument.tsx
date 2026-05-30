import { formatMoney } from "@/lib/formatters/money";
import type { QuotationPrintData } from "@/lib/quotation/print-data";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { PrintDocumentHeader } from "./PrintDocumentHeader";
import { PrintFooter } from "./PrintFooter";
import { PrintPhotos } from "./PrintPhotos";
import { PrintAcceptanceSignatures } from "./PrintAcceptanceSignatures";

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
  const hourlyLabel =
    data.laborRows.length > 0 && data.laborRows[0].rate
      ? formatMoney(data.laborRows[0].rate)
      : "—";

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

      <PrintPhotos photos={data.photos} title="Fotografías del daño" max={3} />

      <h3 className="qdoc-section-title">Detalle de daños y operaciones</h3>
      <table className="qdoc-table">
        <thead>
          <tr>
            <th>Pieza</th>
            <th>Operación</th>
            <th>Tipo de trabajo</th>
            <th className="num">Horas</th>
          </tr>
        </thead>
        <tbody>
          {data.damageRows.length === 0 ? (
            data.workLines.slice(0, 8).map((w, i) => (
              <tr key={i}>
                <td>{w.concept}</td>
                <td>Reparar</td>
                <td>—</td>
                <td className="num">—</td>
              </tr>
            ))
          ) : (
            data.damageRows.map((d, i) => (
              <tr key={i}>
                <td>{d.partName}</td>
                <td>{d.operation}</td>
                <td>{d.workType}</td>
                <td className="num">{d.hours}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 className="qdoc-section-title">Mano de obra</h3>
      <table className="qdoc-table">
        <thead>
          <tr>
            <th>Área / descripción</th>
            <th className="num">Horas</th>
            <th className="num">Tarifa / HR</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.laborRows.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
                —
              </td>
            </tr>
          ) : (
            data.laborRows.map((l, i) => (
              <tr key={i}>
                <td>
                  {[l.area, l.description].filter(Boolean).join(" — ")}
                </td>
                <td className="num">{l.hours ?? "—"}</td>
                <td className="num">
                  {l.rate != null ? formatMoney(l.rate) : hourlyLabel}
                </td>
                <td className="num">{formatMoney(l.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 className="qdoc-section-title">Materiales de pintura y consumibles</h3>
      <table className="qdoc-table">
        <thead>
          <tr>
            <th>Material</th>
            <th className="num">Cant.</th>
            <th className="num">Precio</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.materialRows.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
                —
              </td>
            </tr>
          ) : (
            data.materialRows.map((m, i) => (
              <tr key={i}>
                <td>{m.name}</td>
                <td className="num">
                  {m.quantity} {m.unit ?? ""}
                </td>
                <td className="num">{formatMoney(m.unitPrice)}</td>
                <td className="num">{formatMoney(m.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 className="qdoc-section-title">Repuestos / partes</h3>
      <table className="qdoc-table">
        <thead>
          <tr>
            <th>Repuesto</th>
            <th className="num">Cant.</th>
            <th className="num">Precio</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.partRows.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
                —
              </td>
            </tr>
          ) : (
            data.partRows.map((p, i) => (
              <tr key={i}>
                <td>
                  {p.name}
                  {p.description ? ` — ${p.description}` : ""}
                </td>
                <td className="num">{p.quantity}</td>
                <td className="num">{formatMoney(p.unitPrice)}</td>
                <td className="num">{formatMoney(p.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 className="qdoc-section-title">Resumen del presupuesto</h3>
      <div className="qdoc-summary-box">
        <table>
          <tbody>
            <tr>
              <td>Mano de obra</td>
              <td>{formatMoney(data.laborSubtotal)}</td>
            </tr>
            <tr>
              <td>Materiales</td>
              <td>{formatMoney(data.materialSubtotal)}</td>
            </tr>
            <tr>
              <td>Repuestos</td>
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
                    data.materialSubtotal +
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
      />

      <PrintFooter workshop={workshop} />
    </article>
  );
}
