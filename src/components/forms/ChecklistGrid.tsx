"use client";

import { Controller, type Control } from "react-hook-form";
import { Check } from "lucide-react";
import { CHECKLIST_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WorkOrderFormValues } from "@/lib/validations/work-order";

interface ChecklistGridProps {
  control: Control<WorkOrderFormValues>;
}

export function ChecklistGrid({ control }: ChecklistGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {CHECKLIST_ITEMS.map((item) => (
        <Controller
          key={item.field}
          control={control}
          name={
            `checklist.${item.field}` as `checklist.${keyof WorkOrderFormValues["checklist"]}`
          }
          render={({ field }) => {
            const checked = Boolean(field.value);
            return (
              <label
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition select-none",
                  checked
                    ? "border-rapid-green bg-rapid-green-soft/60 text-rapid-text"
                    : "border-rapid-border bg-white hover:border-rapid-green/40 hover:bg-rapid-green-soft/30",
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
                <span className="text-sm font-medium">{item.label}</span>
              </label>
            );
          }}
        />
      ))}
    </div>
  );
}
