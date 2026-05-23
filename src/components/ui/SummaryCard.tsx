import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: "green" | "neutral" | "dark";
  className?: string;
}

export function SummaryCard({
  label,
  value,
  hint,
  icon,
  accent = "neutral",
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "card p-5 flex items-start justify-between gap-4 relative overflow-hidden",
        className,
      )}
    >
      {accent === "green" && (
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-rapid-green/10" />
      )}
      <div className="min-w-0 relative">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
          {label}
        </p>
        <p className="mt-2 text-2xl sm:text-[28px] font-bold text-rapid-text leading-tight">
          {value}
        </p>
        {hint && (
          <p className="text-xs text-rapid-text-muted mt-1.5">{hint}</p>
        )}
      </div>
      {icon && (
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center relative",
            accent === "green" && "bg-rapid-green/10 text-rapid-green-dark",
            accent === "dark" && "bg-rapid-black text-rapid-green",
            accent === "neutral" && "bg-rapid-bg text-rapid-text-muted",
          )}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
