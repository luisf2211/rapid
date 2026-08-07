import { formatMoney } from "@/lib/formatters/money";
import type { QuotationPrintData } from "@/lib/quotation/print-data";

function emptyRow(colSpan: number) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ textAlign: "center", color: "#888" }}>
        —
      </td>
    </tr>
  );
}

export function PrintQuotationDetailSections({
  data,
  filterBilling,
}: {
  data: QuotationPrintData;
  /** Si se pasa, filtra las líneas por billingTarget. Si no, muestra todas. */
  filterBilling?: "INSURANCE" | "CLIENT";
}) {
  const laborRows = filterBilling
    ? data.laborRows.filter((l) => l.billingTarget === filterBilling)
    : data.laborRows;

  const partRows = filterBilling
    ? data.partRows.filter((p) => p.billingTarget === filterBilling)
    : data.partRows;

  if (laborRows.length === 0 && partRows.length === 0) return null;

  return (
    <>
      <h3 className="qdoc-section-title">Partes a trabajar</h3>
      <table className="qdoc-table">
        <thead>
          <tr>
            <th style={{ width: "28%" }}>Tarea</th>
            <th>Detalle</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {laborRows.length === 0
            ? emptyRow(3)
            : laborRows.map((l, i) => (
                <tr key={i}>
                  <td>{l.area}</td>
                  <td>{l.description || "\u2014"}</td>
                  <td className="num">{formatMoney(l.total)}</td>
                </tr>
              ))}
        </tbody>
      </table>

      <h3 className="qdoc-section-title" style={{ marginTop: 14 }}>
        Piezas a sustituir
      </h3>
      <table className="qdoc-table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>Pieza</th>
            <th className="num">Cant.</th>
            <th className="num">Precio unit.</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {partRows.length === 0
            ? emptyRow(4)
            : partRows.map((p, i) => (
                <tr key={i}>
                  <td>
                    {p.name}
                    {p.description ? ` \u2014 ${p.description}` : ""}
                  </td>
                  <td className="num">{p.quantity}</td>
                  <td className="num">{formatMoney(p.unitPrice)}</td>
                  <td className="num">{formatMoney(p.total)}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </>
  );
}
