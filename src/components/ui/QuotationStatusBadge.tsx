import { cn } from "@/lib/utils";
import { QUOTATION_STATUS_LABELS } from "@/lib/constants";

const styles: Record<string, string> = {
  DRAFT: "bg-gray-50 text-gray-600 border-gray-200/80",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200/80",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  REJECTED: "bg-red-50 text-red-700 border-red-200/80",
  CONVERTED: "bg-blue-50 text-blue-700 border-blue-200/80",
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
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium",
        styles[status] ?? "bg-gray-50 text-gray-600 border-gray-200/80",
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
}
