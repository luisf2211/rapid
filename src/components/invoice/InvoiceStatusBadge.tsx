import { cn } from "@/lib/utils";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";

const styles: Record<string, string> = {
  PENDING: "bg-gray-50 text-gray-700 border-gray-200",
  INVOICED: "bg-blue-50 text-blue-700 border-blue-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VOID: "bg-red-50 text-red-700 border-red-200",
};

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = INVOICE_STATUS_LABELS[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold",
        styles[status] ?? "bg-gray-50 text-gray-700 border-gray-200",
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
