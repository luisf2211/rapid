import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";

export function PrintFooter({ workshop }: { workshop: WorkshopPrintInfo }) {
  return (
    <footer className="qdoc-footer">
      <div>
        <strong className="qdoc-red">{workshop.businessName}</strong> —{" "}
        {workshop.tagline}
      </div>
      <div style={{ marginTop: 4 }}>
        FB: {workshop.socialFacebook} · IG: {workshop.socialInstagram} ·{" "}
        {workshop.website}
      </div>
    </footer>
  );
}
