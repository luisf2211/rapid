import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import { DEFAULT_WORKSHOP_STAMP_URL } from "@/lib/workshop/stamp";

/** Sello digital del taller en documentos impresos. */
export function PrintStamp({
  workshop,
  className = "print-stamp",
}: {
  workshop: WorkshopPrintInfo;
  className?: string;
}) {
  const src = workshop.stampUrl || DEFAULT_WORKSHOP_STAMP_URL;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      width={112}
      height={112}
      aria-hidden
    />
  );
}
