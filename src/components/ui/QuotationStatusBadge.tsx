import { cn } from "@/lib/utils";
import { QUOTATION_STATUS_LABELS } from "@/lib/constants";

const styles: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-700 border-gray-200",
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  APPROVED: "bg-rapid-green-soft text-rapid-green-dark border-rapid-green/30",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CONVERTED: "bg-blue-50 text-blue-700 border-blue-200",
};

export function QuotationStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = QUOTATION_STATUS_LABELS[status] ?? status;
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
