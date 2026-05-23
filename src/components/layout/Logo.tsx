import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export function Logo({ className, variant = "dark" }: LogoProps) {
  const textColor = variant === "dark" ? "text-white" : "text-rapid-text";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-rapid-green flex items-center justify-center shadow-[0_0_18px_rgba(0,200,83,0.45)]">
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
      <div className="flex flex-col leading-tight">
        <span className={cn("font-bold tracking-tight text-lg", textColor)}>
          Rapid
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-rapid-green font-semibold">
          Paint Shop OS
        </span>
      </div>
    </div>
  );
}
