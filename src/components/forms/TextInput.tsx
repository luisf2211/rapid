import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, error, hint, className, containerClassName, ...props },
    ref,
  ) {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="form-label" htmlFor={props.id ?? props.name}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={props.id ?? props.name}
          className={cn(
            "form-input",
            error && "border-red-300 focus:border-red-400",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-rapid-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
