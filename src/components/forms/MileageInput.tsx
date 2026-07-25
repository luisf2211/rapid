import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { MILEAGE_UNITS, type MileageUnit } from "@/lib/work-order/mileage";

const UNIT_TITLES: Record<MileageUnit, string> = {
  mi: "Millas",
  km: "Kilómetros",
};

interface MileageInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  unit: MileageUnit;
  onUnitChange: (unit: MileageUnit) => void;
}

/** Odómetro: número libre + unidad elegida entre mi y km, ambas siempre visibles. */
export const MileageInput = forwardRef<HTMLInputElement, MileageInputProps>(
  function MileageInput(
    { label, error, unit, onUnitChange, className, ...props },
    ref,
  ) {
    return (
      <div>
        {label && (
          <label className="form-label" htmlFor={props.id ?? props.name}>
            {label}
          </label>
        )}
        <div className="flex items-stretch gap-2">
          <input
            ref={ref}
            id={props.id ?? props.name}
            inputMode="numeric"
            className={cn(
              "form-input flex-1 min-w-0",
              error && "border-rapid-error focus:border-rapid-error",
              className,
            )}
            {...props}
          />
          <div
            role="group"
            aria-label="Unidad del odómetro"
            className="flex h-14 shrink-0 items-center gap-1 rounded-lg border border-rapid-border bg-rapid-surface-soft p-1"
          >
            {MILEAGE_UNITS.map((option) => {
              const active = option.value === unit;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  title={UNIT_TITLES[option.value]}
                  onClick={() => onUnitChange(option.value)}
                  className={cn(
                    "h-full w-12 rounded-md text-sm font-semibold transition-colors",
                    active
                      ? "bg-rapid-green text-white"
                      : "text-rapid-text-muted hover:text-rapid-text",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-rapid-error">{error}</p>}
      </div>
    );
  },
);
