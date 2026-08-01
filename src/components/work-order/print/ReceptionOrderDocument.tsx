import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { InvoicePrintFooter } from "@/components/invoice/print/InvoicePrintFooter";
import { PrintWorkshopReceiverSignature } from "@/components/print/PrintWorkshopReceiverSignature";
import { resolvePhotoUrl } from "@/lib/photos";

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

      {(data.requestedDamages || data.observations) && (
        <div className="idoc-grid-2" style={{ marginBottom: 12 }}>
          {data.requestedDamages && (
            <div>
              <h3 className="idoc-section-title">Daños solicitados</h3>
              <div className="idoc-box">
                <p className="idoc-text-block">{data.requestedDamages}</p>
              </div>
            </div>
          )}
          {data.observations && (
            <div>
              <h3 className="idoc-section-title">Observaciones</h3>
              <div className="idoc-box">
                <p className="idoc-text-block">{data.observations}</p>
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
        <p className="idoc-damage-note" style={{ fontSize: "8pt", marginTop: 8, fontStyle: "italic" }}>
          Ver hoja adjunta de inspección de daños ({data.damages.length} señalado{data.damages.length > 1 ? "s" : ""}).
        </p>
      )}

      <div className="idoc-legal-section">
        <h3 className="idoc-section-title">Condiciones legales y garantías del servicio</h3>
        <ol className="idoc-legal-list">
          <li>El cliente declara ser propietario del vehículo o estar debidamente autorizado para solicitar los servicios objeto de esta orden de trabajo.</li>
          <li>El taller realizará únicamente los trabajos autorizados por el cliente. Cualquier trabajo adicional requerirá aprobación previa del propietario o su representante.</li>
          <li>El cliente autoriza al taller a efectuar pruebas de manejo, inspecciones y movimientos internos del vehículo que sean necesarios para la correcta ejecución de los trabajos contratados.</li>
          <li>El taller no se responsabiliza por objetos personales, dinero, herramientas, mercancías u otros bienes dejados dentro del vehículo.</li>
          <li>Cuando el vehículo presente daños ocultos, defectos mecánicos, eléctricos o estructurales no visibles al momento de la recepción, el taller notificará al cliente para su evaluación y aprobación correspondiente.</li>
          <li>Los trabajos de pintura y reparación de carrocería cuentan con garantía limitada contra defectos de aplicación, desprendimiento prematuro, agrietamiento o fallas atribuibles directamente al proceso realizado por el taller, por un período de 6 meses a partir de la fecha de entrega.</li>
          <li>La garantía no cubre daños ocasionados por accidentes posteriores, mal uso, negligencia, fenómenos naturales, exposición a sustancias químicas, corrosión preexistente, modificaciones realizadas por terceros o falta de mantenimiento.</li>
          <li>Las piezas, materiales o repuestos suministrados por el cliente no estarán cubiertos por garantía del taller.</li>
          <li>El vehículo deberá ser retirado dentro de los 5 días siguientes a la notificación de finalización de los trabajos. Vencido dicho plazo, podrán generarse cargos por almacenamiento.</li>
          <li>El cliente acepta que el vehículo permanecerá bajo custodia del taller únicamente durante el período de reparación y sujeto a las condiciones aquí establecidas.</li>
          <li>La entrega del vehículo y la firma de conformidad por parte del cliente constituyen aceptación de los trabajos realizados, salvo observaciones expresamente anotadas en el documento de entrega.</li>
          <li>Cualquier reclamación relacionada con los trabajos efectuados deberá presentarse dentro del período de garantía establecido y acompañarse de la documentación correspondiente.</li>
        </ol>
        <p className="idoc-legal-accept">Acepto las condiciones legales y de garantía anteriormente descritas.</p>
      </div>

      <h3 className="idoc-section-title">Conformidad y firmas</h3>
      <div className="idoc-signatures-3">
        <div className="idoc-sig-block">
          {data.customerReceivedSignature ? (
            <div className="idoc-sig-signature-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  resolvePhotoUrl(data.customerReceivedSignature) ??
                  data.customerReceivedSignature
                }
                alt=""
              />
            </div>
          ) : (
            <div className="idoc-sig-line" />
          )}
          <div className="idoc-sig-label">Cliente — entrega</div>
          <p style={{ fontSize: "9pt", marginTop: 4 }}>{data.customerName}</p>
        </div>
        <PrintWorkshopReceiverSignature
          workshop={workshop}
          subtitle={
            <p style={{ fontSize: "9pt", marginTop: 4 }}>
              {data.receivedBy ?? "________________"}
            </p>
          }
        />
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
