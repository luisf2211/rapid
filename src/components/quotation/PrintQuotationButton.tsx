import Link from "next/link";
import { Printer } from "lucide-react";

/** Botón(es) de impresión para cotización. Si es de seguro, muestra 3 opciones. */
export function PrintQuotationButton({
  quotationId,
  quotationType,
  variant = "secondary",
}: {
  quotationId: number;
  quotationType?: string;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "btn-primary inline-flex items-center gap-2"
      : "btn-secondary inline-flex items-center gap-2";

  if (quotationType === "INSURANCE") {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={`/print/quotations/${quotationId}?auto=1`}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          <Printer className="w-4 h-4" />
          Completa
        </Link>
        <Link
          href={`/print/quotations/${quotationId}?auto=1&view=insurance`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Aseguradora
        </Link>
        <Link
          href={`/print/quotations/${quotationId}?auto=1&view=client`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Cliente
        </Link>
      </div>
    );
  }

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
