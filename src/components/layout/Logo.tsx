import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  /** Solo marca compacta (sidebar contraído) */
  compact?: boolean;
}

/**
 * Wordmark tipográfico de Rapid. Sin iconos genéricos: solo el nombre
 * con un punto verde de acento. Limpio y con carácter (estilo Vercel/Linear).
 */
export function Logo({ className, variant = "light", compact = false }: LogoProps) {
  const textColor = variant === "dark" ? "text-white" : "text-rapid-text";

  if (compact) {
    // Marca compacta: la "R" con el punto de acento.
    return (
      <span
        className={cn(
          "inline-flex items-baseline text-[19px] font-bold tracking-[-0.03em]",
          textColor,
          className,
        )}
      >
        R
        <span className="ml-[1px] h-[5px] w-[5px] translate-y-[-1px] rounded-full bg-rapid-green" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline text-[20px] font-bold tracking-[-0.03em]",
        textColor,
        className,
      )}
    >
      Rapid
      <span className="ml-[2px] mb-[3px] h-[6px] w-[6px] rounded-full bg-rapid-green" />
    </span>
  );
}
