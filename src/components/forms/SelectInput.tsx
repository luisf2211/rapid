import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: ReadonlyArray<Option>;
  containerClassName?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  function SelectInput(
    { label, error, hint, options, className, containerClassName, ...props },
    ref,
  ) {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="form-label" htmlFor={props.id ?? props.name}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={props.id ?? props.name}
          className={cn(
            "form-input pr-8 appearance-none bg-[length:14px_14px] bg-[right_0.6rem_center] bg-no-repeat",
            "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')]",
            error && "border-rapid-error focus:border-rapid-error",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-rapid-error">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-rapid-text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
