import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";

export function InvoicePrintFooter({ workshop }: { workshop: WorkshopPrintInfo }) {
  return (
    <footer className="idoc-footer">
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
