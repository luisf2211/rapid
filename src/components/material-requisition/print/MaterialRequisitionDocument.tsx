import { formatMoney } from "@/lib/formatters/money";
import type {
  MaterialRequisitionPrintData,
  MaterialRequisitionPrintLine,
} from "@/lib/material-requisition/print-data";
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

function RequisitionLinesTable({
  title,
  lines,
  subtotal,
}: {
  title: string;
  lines: MaterialRequisitionPrintLine[];
  subtotal: number;
}) {
  if (lines.length === 0) return null;

  return (
    <>
      <h3 className="idoc-section-title" style={{ marginTop: "1rem" }}>
        {title}
      </h3>
      <table className="idoc-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th className="num">Cant.</th>
            <th className="num">Precio</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td>
                {line.productName}
                {line.assignedEmployee && (
                  <div style={{ fontSize: "8pt", color: "#444" }}>
                    Asignado: {line.assignedEmployee}
                  </div>
                )}
              </td>
              <td className="num">{line.quantity}</td>
              <td className="num">{formatMoney(line.unitPrice)}</td>
              <td className="num">{formatMoney(line.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="num" style={{ fontWeight: 700 }}>
              Subtotal {title.toLowerCase()}
            </td>
            <td className="num" style={{ fontWeight: 700 }}>
              {formatMoney(subtotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}

export function MaterialRequisitionDocument({
  data,
  workshop,
}: {
  data: MaterialRequisitionPrintData;
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
          <div className="idoc-meta-line">Fecha: {data.createdAt}</div>
          <div className="idoc-meta-line">Orden: {data.workOrderNumber}</div>
        </div>
      </header>

      <div className="idoc-grid-2">
        <div>
          <h3 className="idoc-section-title">Cliente</h3>
          <div className="idoc-box">{field("Nombre", data.customerName)}</div>
        </div>
        <div>
          <h3 className="idoc-section-title">Vehículo</h3>
          <div className="idoc-box">
            {field("Marca / modelo", data.vehicleLabel)}
            {field("Placa", data.plate)}
          </div>
        </div>
      </div>

      <RequisitionLinesTable
        title="Materiales"
        lines={data.materialLines}
        subtotal={data.materialSubtotal}
      />
      <RequisitionLinesTable
        title="Pintura"
        lines={data.paintLines}
        subtotal={data.paintSubtotal}
      />

      {(data.materialLines.length > 0 || data.paintLines.length > 0) && (
        <table className="idoc-table" style={{ marginTop: "0.75rem" }}>
          <tfoot>
            <tr>
              <td colSpan={3} className="num" style={{ fontWeight: 700 }}>
                Total requisición
              </td>
              <td className="num" style={{ fontWeight: 700 }}>
                {formatMoney(data.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      <div className="idoc-signatures">
        <div className="idoc-sig-block">
          <div className="idoc-sig-line" />
          <div className="idoc-sig-label">Solicitado por</div>
        </div>
        <PrintWorkshopReceiverSignature workshop={workshop} />
      </div>

      <InvoicePrintFooter workshop={workshop} />
    </article>
  );
}
