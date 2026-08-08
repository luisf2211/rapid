import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  /** Solo ícono (sidebar contraído) */
  compact?: boolean;
}

export function Logo({ className, variant = "light", compact = false }: LogoProps) {
  const textColor = variant === "dark" ? "text-white" : "text-rapid-text";
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact && "justify-center",
        className,
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-rapid-green flex items-center justify-center shadow-[0_1px_3px_rgba(0,200,83,0.3)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[18px] h-[18px] text-white"
          aria-hidden="true"
        >
          <path
            d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!compact && (
        <span className={cn("font-bold tracking-tight text-[15px]", textColor)}>
          Rapid
        </span>
      )}
    </div>
  );
}
