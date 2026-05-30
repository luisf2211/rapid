import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";
import { resolvePhotoUrl } from "@/lib/photos";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { InvoicePrintFooter } from "@/components/invoice/print/InvoicePrintFooter";

function field(label: string, value: string | null | undefined) {
  if (!value) return null;
  return (
    <div className="idoc-field">
      <strong>{label}:</strong> {value}
    </div>
  );
}

export function ReceptionOrderDocument({
  data,
  workshop,
}: {
  data: ReceptionPrintData;
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
            <div className="idoc-company-meta">
              {workshop.legalName && <div>{workshop.legalName}</div>}
              {workshop.rnc && <div>RNC: {workshop.rnc}</div>}
              {workshop.address && <div>{workshop.address}</div>}
              <div>
                {[workshop.phone, workshop.email].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        </div>
        <div className="idoc-doc-meta">
          <div className="idoc-doc-title">{data.docTitle}</div>
          <div className="idoc-doc-number">No. {data.docNumber}</div>
          <div className="idoc-meta-line">Fecha orden: {data.orderDate}</div>
          <div className="idoc-meta-line">Estado: {data.statusLabel}</div>
          {data.quotationRef && (
            <div className="idoc-meta-line">Cotización: {data.quotationRef}</div>
          )}
        </div>
      </header>

      <div className="idoc-grid-2">
        <div>
          <h3 className="idoc-section-title">Datos del cliente</h3>
          <div className="idoc-box">
            {field("Nombre", data.customerName)}
            {field("Teléfono", data.phone)}
            {field("Email", data.email)}
            {field("Dirección", data.address)}
          </div>
        </div>
        <div>
          <h3 className="idoc-section-title">Datos del vehículo</h3>
          <div className="idoc-box">
            {field(
              "Marca / Modelo",
              [data.brand, data.model, data.vehicleYear].filter(Boolean).join(" ") ||
                null,
            )}
            {field("Color", data.color)}
            {field("Placa", data.plate)}
            {field("Millaje", data.mileage)}
            {field("Motor", data.engine)}
          </div>
        </div>
      </div>

      <h3 className="idoc-section-title">Recepción del vehículo</h3>
      <div className="idoc-grid-2">
        <div className="idoc-box">
          {field("Entrada", data.deliveryDateTime)}
          {field("Combustible", data.fuelLevel)}
          {field("Recibido por (taller)", data.receivedBy)}
          {field("Entregado por (cliente)", data.deliveredBy)}
        </div>
        <div className="idoc-box">
          {field("Salida estimada", data.exitDateTime)}
        </div>
      </div>

      {(data.requestedDamages || data.observations || data.notes) && (
        <div className="idoc-grid-2" style={{ marginBottom: 12 }}>
          {data.requestedDamages && (
            <div>
              <h3 className="idoc-section-title">Daños solicitados</h3>
              <div className="idoc-box">
                <p className="idoc-text-block">{data.requestedDamages}</p>
              </div>
            </div>
          )}
          {(data.observations || data.notes) && (
            <div>
              <h3 className="idoc-section-title">Observaciones</h3>
              <div className="idoc-box">
                {data.observations && (
                  <p className="idoc-text-block">{data.observations}</p>
                )}
                {data.notes && (
                  <>
                    {data.observations && <hr style={{ margin: "8px 0", borderColor: "#ccc" }} />}
                    <p className="idoc-text-block">
                      <strong>Notas internas:</strong> {data.notes}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <h3 className="idoc-section-title">
        Checklist de recepción
        <span style={{ fontWeight: 400, marginLeft: 8, textTransform: "none" }}>
          ({data.checklistSummary})
        </span>
      </h3>
      <div className="idoc-checklist-grid">
        {data.checklist.map((item, i) => (
          <div key={i} className="idoc-check-item">
            <span
              className={`idoc-check-box ${item.checked ? "on" : ""}`}
              aria-hidden
            >
              {item.checked ? "✓" : ""}
            </span>
            <div className="idoc-check-label">
              {item.label}
              {item.comment && (
                <div className="idoc-check-comment">{item.comment}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.damages.length > 0 && (
        <>
          <h3 className="idoc-section-title">Daños registrados</h3>
          <table className="idoc-table">
            <thead>
              <tr>
                <th>Lado</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th className="num">X</th>
                <th className="num">Y</th>
              </tr>
            </thead>
            <tbody>
              {data.damages.map((d, i) => (
                <tr key={i}>
                  <td>{d.side}</td>
                  <td>{d.type}</td>
                  <td>{d.description}</td>
                  <td className="num">{d.positionX}</td>
                  <td className="num">{d.positionY}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.photos.length > 0 && (
        <section>
          <h3 className="idoc-section-title">Fotografías</h3>
          <div className="idoc-photos">
            {data.photos.slice(0, 6).map((p, i) => (
              <div key={i} className="idoc-photo">
                {p.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvePhotoUrl(p.url)}
                    alt={p.description ?? p.label}
                  />
                ) : (
                  <div className="idoc-photo-placeholder">Sin foto</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <h3 className="idoc-section-title">Conformidad y firmas</h3>
      <div className="idoc-signatures-3">
        <div className="idoc-sig-block">
          <div className="idoc-sig-line" />
          <div className="idoc-sig-label">Cliente — entrega</div>
          <p style={{ fontSize: "9pt", marginTop: 4 }}>{data.customerName}</p>
        </div>
        <div className="idoc-sig-block">
          <div className="idoc-sig-line" />
          <div className="idoc-sig-label">Recibido por (taller)</div>
          <p style={{ fontSize: "9pt", marginTop: 4 }}>
            {data.receivedBy ?? "________________"}
          </p>
        </div>
        <div className="idoc-sig-block">
          <div className="idoc-sig-line" />
          <div className="idoc-sig-label">Cliente — retiro</div>
          <p style={{ fontSize: "9pt", marginTop: 4 }}>Fecha: ___/___/______</p>
        </div>
      </div>

      <InvoicePrintFooter workshop={workshop} />
    </article>
  );
}
