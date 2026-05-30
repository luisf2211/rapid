import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  /** Solo ícono (sidebar contraído) */
  compact?: boolean;
}

export function Logo({ className, variant = "dark", compact = false }: LogoProps) {
  const textColor = variant === "dark" ? "text-white" : "text-rapid-text";
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        compact && "justify-center",
        className,
      )}
    >
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-rapid-green flex items-center justify-center shadow-[0_2px_12px_rgba(0,200,83,0.35)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-rapid-black"
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
      </div>
      {!compact && (
        <span className={cn("font-bold tracking-tight text-lg", textColor)}>
          Rapid
        </span>
      )}
    </div>
  );
}
