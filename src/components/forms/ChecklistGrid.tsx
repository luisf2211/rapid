"use client";

import { Controller, type Control } from "react-hook-form";
import { Check, MessageSquare } from "lucide-react";
import {
  CHECKLIST_ITEMS,
  CHECKLIST_LABEL_BY_FIELD,
  type LegacyChecklistField,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WorkOrderFormValues } from "@/lib/validations/work-order";

interface ChecklistGridProps {
  control: Control<WorkOrderFormValues>;
  /** Ítems retirados que esta orden ya tenía guardados y hay que conservar. */
  legacyFields?: LegacyChecklistField[];
}

export function ChecklistGrid({ control, legacyFields = [] }: ChecklistGridProps) {
  const items = [
    ...CHECKLIST_ITEMS.map((item) => ({ ...item, legacy: false })),
    ...legacyFields.map((field) => ({
      field,
      label: CHECKLIST_LABEL_BY_FIELD[field],
      legacy: true,
    })),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.field}
          className="rounded-lg border border-rapid-border bg-white p-3 space-y-2.5"
        >
          <Controller
            control={control}
            name={`checklist.${item.field}.checked`}
            render={({ field }) => {
              const checked = Boolean(field.value);
              return (
                <label
                  className={cn(
                    "flex items-center gap-2.5 cursor-pointer select-none",
                    checked ? "text-rapid-text" : "text-rapid-text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition",
                      checked
                        ? "bg-rapid-green border-rapid-green text-white"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {item.legacy && (
                    <span className="ml-auto shrink-0 rounded-full bg-rapid-surface-soft px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-rapid-text-muted">
                      Retirado
                    </span>
                  )}
                </label>
              );
            }}
          />

          <Controller
            control={control}
            name={`checklist.${item.field}.comment`}
            render={({ field }) => (
              <div className="relative">
                <MessageSquare className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-rapid-text-muted pointer-events-none" />
                <textarea
                  {...field}
                  value={field.value ?? ""}
                  rows={2}
                  placeholder="Comentario opcional..."
                  className="form-input pl-8 text-xs resize-none min-h-[52px]"
                />
              </div>
            )}
          />
        </div>
      ))}
    </div>
  );
}
