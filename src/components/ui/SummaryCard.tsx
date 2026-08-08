import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function SummaryCard({
  label,
  value,
  hint,
  icon,
  className,
}: SummaryCardProps) {
  return (
    <div className={cn("card p-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <p className="text-xs font-medium text-rapid-text-muted">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold text-rapid-text tabular-nums leading-none tracking-tight">
          {value}
        </p>
        {hint && (
          <p className="text-[11px] text-rapid-text-muted-soft mt-1.5">{hint}</p>
        )}
      </div>
      {icon && (
        <div className="shrink-0 w-9 h-9 rounded-lg bg-rapid-surface-strong text-rapid-text-muted flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
}
