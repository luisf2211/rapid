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
    <div className={cn("card p-5 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-rapid-text-muted">
          {label}
        </p>
        <p className="mt-2 text-[22px] sm:text-[26px] font-bold text-rapid-text tabular-nums leading-none tracking-tight">
          {value}
        </p>
        {hint && (
          <p className="text-xs text-rapid-text-muted mt-1.5">{hint}</p>
        )}
      </div>
      {icon && (
        <div className="shrink-0 w-10 h-10 rounded-xl bg-rapid-surface-strong text-rapid-text-muted flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
}
