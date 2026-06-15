import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";

type Props = {
  workshop: WorkshopPrintInfo;
  /** Pie personalizado (factura o cotización); si no se pasa, usa invoiceFooter. */
  customFooter?: string | null;
};

export function InvoicePrintFooter({ workshop, customFooter }: Props) {
  const footerText = customFooter ?? workshop.invoiceFooter;

  return (
    <footer className="idoc-footer">
      {footerText ? (
        <div style={{ marginBottom: 8, whiteSpace: "pre-wrap" }}>{footerText}</div>
      ) : null}
      <div>
        <strong>{workshop.businessName}</strong> — {workshop.tagline}
      </div>
      <div style={{ marginTop: 4 }}>
        FB: {workshop.socialFacebook} · IG: {workshop.socialInstagram} ·{" "}
        {workshop.website}
      </div>
    </footer>
  );
}
