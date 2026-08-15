import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";

export function PrintFooter({ workshop }: { workshop: WorkshopPrintInfo }) {
  return (
    <footer className="qdoc-footer">
      <div>
        <strong className="qdoc-red">{workshop.businessName}</strong> —{" "}
        {workshop.tagline}
      </div>
    </footer>
  );
}
