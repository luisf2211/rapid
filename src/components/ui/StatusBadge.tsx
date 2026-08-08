import { cn } from "@/lib/utils";
import { WORK_ORDER_STATUS_LABELS } from "@/lib/constants";

const styles: Record<string, string> = {
  RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200/80",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200/80",
  DELIVERED: "bg-violet-50 text-violet-700 border-violet-200/80",
  CANCELLED: "bg-red-50 text-red-700 border-red-200/80",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = WORK_ORDER_STATUS_LABELS[status] ?? status;
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
