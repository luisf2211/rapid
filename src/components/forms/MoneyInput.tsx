import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput(
    { label, error, className, containerClassName, ...props },
    ref,
  ) {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="form-label" htmlFor={props.id ?? props.name}>
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-rapid-text-muted">
            $
          </span>
          <input
            ref={ref}
            id={props.id ?? props.name}
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className={cn(
              "form-input pl-7 text-right tabular-nums",
              error && "border-rapid-error focus:border-rapid-error",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rapid-error">{error}</p>}
      </div>
    );
  },
);
