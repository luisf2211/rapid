import Link from "next/link";
import { Printer } from "lucide-react";

/** Un solo clic: abre vista de impresión / PDF. */
export function PrintQuotationButton({
  quotationId,
  variant = "secondary",
}: {
  quotationId: number;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "btn-primary inline-flex items-center gap-2"
      : "btn-secondary inline-flex items-center gap-2";

  return (
    <Link
      href={`/print/quotations/${quotationId}?auto=1`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <Printer className="w-4 h-4" />
      Imprimir
    </Link>
  );
}
