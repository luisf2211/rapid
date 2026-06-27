"use client";

import { useMemo } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { InventoryPartOption } from "@/lib/inventory/client";
import type {
  MaterialRequisitionFormValues,
} from "@/lib/validations/material-requisition";
import { TextInput } from "@/components/forms/TextInput";
import { FractionQuantityInput } from "@/components/forms/FractionQuantityInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { formatMoney } from "@/lib/formatters/money";
import { formatFractionQuantity, parseFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { requisitionLineTotal } from "@/lib/material-requisition/line-total";
import { MATERIAL_REQUISITION_LINE_TYPES } from "@/lib/constants";

type LineFieldName = "materialItems" | "paintItems";

type Props = {
  title: string;
  subtitle: string;
  fieldName: LineFieldName;
  parts: InventoryPartOption[];
  fields: { id: string }[];
  watched: MaterialRequisitionFormValues[LineFieldName] | undefined;
  control: Control<MaterialRequisitionFormValues>;
  register: UseFormRegister<MaterialRequisitionFormValues>;
  errors: FieldErrors<MaterialRequisitionFormValues>;
  partById: Map<number, InventoryPartOption>;
  onAppend: () => void;
  onRemove: (idx: number) => void;
  onPartChange: (idx: number, partId: number) => void;
  /** Pintura: el total no se prorratea por fracción. */
  paintPricing?: boolean;
};

export function RequisitionLinesEditor({
  title,
  subtitle,
  fieldName,
  parts,
  fields,
  watched,
  control,
  register,
  errors,
  partById,
  onAppend,
  onRemove,
  onPartChange,
  paintPricing = false,
}: Props) {
  const lineType = paintPricing
    ? MATERIAL_REQUISITION_LINE_TYPES.PAINT
    : MATERIAL_REQUISITION_LINE_TYPES.MATERIAL;

  const sectionTotal = useMemo(() => {
    if (!watched) return 0;
    return watched.reduce(
      (acc, it) =>
        acc + requisitionLineTotal(lineType, it?.quantity, it?.unitPrice),
      0,
    );
  }, [watched, lineType]);

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-lg">{title}</h2>
          <p className="text-sm text-rapid-text-muted">{subtitle}</p>
          {sectionTotal > 0 && (
            <p className="text-sm font-semibold text-rapid-green-dark mt-1">
              Subtotal: {formatMoney(sectionTotal)}
            </p>
          )}
          {paintPricing && (
            <p className="text-xs text-rapid-text-muted mt-1">
              Al utilizar pintura se registra el costo de la unidad completa
              (galón), aunque la cantidad sea una fracción.
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={onAppend}
          disabled={parts.length === 0}
        >
          <Plus className="w-4 h-4" /> Agregar línea
        </button>
      </div>

      {parts.length === 0 ? (
        <p className="text-sm text-rapid-text-muted">
          No hay productos registrados en este inventario.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => {
            const partId = Number(watched?.[idx]?.inventoryPartId);
            const part = partId ? partById.get(partId) : undefined;
            const q = parseFractionQuantity(watched?.[idx]?.quantity) ?? 0;
            const p = Number(watched?.[idx]?.unitPrice ?? 0);
            const lineTotal = requisitionLineTotal(
              lineType,
              watched?.[idx]?.quantity,
              watched?.[idx]?.unitPrice,
            );
            const overStock = part != null && q > part.available;

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-lg bg-rapid-bg/50 border border-rapid-border"
              >
                <div className="sm:col-span-4">
                  <label className="form-label">Producto *</label>
                  <Controller
                    control={control}
                    name={`${fieldName}.${idx}.inventoryPartId`}
                    render={({ field: f }) => (
                      <select
                        className="form-input"
                        value={f.value ? String(f.value) : ""}
                        onBlur={f.onBlur}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          f.onChange(id);
                          if (id) onPartChange(idx, id);
                        }}
                      >
                        <option value="">Seleccionar...</option>
                        {parts.map((inv) => {
                          const selectedElsewhere = watched?.some(
                            (row, i) =>
                              i !== idx &&
                              Number(row?.inventoryPartId) === inv.id,
                          );
                          return (
                            <option
                              key={inv.id}
                              value={inv.id}
                              disabled={selectedElsewhere}
                            >
                              {inv.sku} · {inv.name} (disp.{" "}
                              {formatFractionQuantity(inv.available)} {inv.unit})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {errors[fieldName]?.[idx]?.inventoryPartId && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[fieldName]?.[idx]?.inventoryPartId?.message}
                    </p>
                  )}
                  {part && (
                    <p className="mt-1 text-xs text-rapid-text-muted">
                      Disponible: {formatFractionQuantity(part.available)}{" "}
                      {part.unit}
                    </p>
                  )}
                  {overStock && (
                    <p className="mt-1 text-xs text-red-600">
                      Cantidad mayor al stock disponible
                    </p>
                  )}
                </div>
                <FractionQuantityInput
                  label="Cantidad"
                  containerClassName="sm:col-span-2"
                  {...register(`${fieldName}.${idx}.quantity`)}
                  error={errors[fieldName]?.[idx]?.quantity?.message}
                />
                <MoneyInput
                  label="Precio unitario"
                  containerClassName="sm:col-span-2"
                  {...register(`${fieldName}.${idx}.unitPrice`)}
                />
                <div className="sm:col-span-2">
                  <label className="form-label">
                    {paintPricing ? "Costo unidad" : "Total"}
                  </label>
                  <div className="form-input bg-white text-right tabular-nums font-semibold text-rapid-green-dark">
                    {formatMoney(lineTotal)}
                  </div>
                  {paintPricing && q > 0 && q < 1 && (
                    <p className="mt-1 text-[11px] text-rapid-text-muted">
                      Precio galón: {formatMoney(p)}
                    </p>
                  )}
                </div>
                <TextInput
                  label="Asignado a"
                  placeholder="Empleado"
                  containerClassName="sm:col-span-1"
                  {...register(`${fieldName}.${idx}.assignedEmployee`)}
                />
                <div className="sm:col-span-1 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    aria-label="Eliminar línea"
                    className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
