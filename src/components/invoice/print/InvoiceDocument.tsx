import { formatMoney } from "@/lib/formatters/money";
import type { InvoicePrintData } from "@/lib/invoice/print-data";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { InvoicePrintFooter } from "./InvoicePrintFooter";
import { PrintWorkshopReceiverSignature } from "@/components/print/PrintWorkshopReceiverSignature";

function field(label: string, value: string | null | undefined) {
  if (!value) return null;
  return (
    <div className="idoc-field">
      <strong>{label}:</strong> {value}
    </div>
  );
}

export function InvoiceDocument({
  data,
  workshop,
}: {
  data: InvoicePrintData;
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
          <div className="idoc-meta-line">Fecha: {data.invoiceDate}</div>
          <div className="idoc-meta-line">Tipo: {data.billingLabel}</div>
        </div>
      </header>

      <div className="idoc-grid-2">
        <div>
          <h3 className="idoc-section-title">Datos del cliente</h3>
          <div className="idoc-box">
            {field("Nombre", data.customerName)}
            {field("Teléfono", data.phone)}
            {field("Email", data.email)}
            {field("Cédula", data.nationalId)}
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
            {field("Placa", data.plate)}
            {field("VIN", data.vin)}
          </div>
        </div>
      </div>

      {data.billingType === "INSURANCE" && (
        <div className="idoc-box" style={{ marginBottom: 16 }}>
          {field("Aseguradora", data.insuranceCompany)}
          {field("Póliza", data.policyNumber)}
          {data.deductibleAmount != null && data.deductibleAmount > 0 && (
            <div className="idoc-field">
              <strong>Deducible:</strong> {formatMoney(data.deductibleAmount)}
            </div>
          )}
        </div>
      )}

      <h3 className="idoc-section-title">Detalle</h3>
      <table className="idoc-table">
        <thead>
          <tr>
            <th style={{ width: "50%" }}>Concepto</th>
            <th className="num">Cant.</th>
            <th className="num">Precio unit.</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((row, i) => (
            <tr key={i}>
              <td>{row.description}</td>
              <td className="num">{row.quantity}</td>
              <td className="num">{formatMoney(row.unitPrice)}</td>
              <td className="num">{formatMoney(row.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="idoc-totals">
        <div className="idoc-totals-row">
          <span>Mano de obra</span>
          <span>{formatMoney(data.laborSubtotal)}</span>
        </div>
        {data.materialSubtotal > 0 && (
          <div className="idoc-totals-row">
            <span>Materiales</span>
            <span>{formatMoney(data.materialSubtotal)}</span>
          </div>
        )}
        {data.partsSubtotal > 0 && (
          <div className="idoc-totals-row">
            <span>Repuestos</span>
            <span>{formatMoney(data.partsSubtotal)}</span>
          </div>
        )}
        <div className="idoc-totals-row">
          <span>Subtotal</span>
          <span>{formatMoney(data.subtotal)}</span>
        </div>
        {data.discountAmount > 0 && (
          <div className="idoc-totals-row">
            <span>Descuento</span>
            <span>−{formatMoney(data.discountAmount)}</span>
          </div>
        )}
        {data.showTax && (
          <div className="idoc-totals-row">
            <span>ITBIS ({(data.taxRate * 100).toFixed(0)}%)</span>
            <span>{formatMoney(data.taxAmount)}</span>
          </div>
        )}
        <div className="idoc-totals-row idoc-totals-grand">
          <span>Total</span>
          <span>{formatMoney(data.grandTotal)}</span>
        </div>
      </div>

      {data.notes && (
        <p className="idoc-notes">
          <strong>Notas:</strong> {data.notes}
        </p>
      )}

      <div className="idoc-signatures">
        <div className="idoc-sig-block">
          <div className="idoc-sig-line" />
          <div className="idoc-sig-label">Cliente</div>
        </div>
        <PrintWorkshopReceiverSignature
          workshop={workshop}
          label="Recibido conforme (taller)"
        />
      </div>

      <InvoicePrintFooter workshop={workshop} customFooter={workshop.invoiceFooter} />
    </article>
  );
}
