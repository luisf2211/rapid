import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextAreaInputProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const TextAreaInput = forwardRef<HTMLTextAreaElement, TextAreaInputProps>(
  function TextAreaInput(
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
        <textarea
          ref={ref}
          id={props.id ?? props.name}
          rows={props.rows ?? 3}
          className={cn(
            "form-input resize-y",
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
