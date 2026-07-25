"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inventoryPartSchema,
  type InventoryPartInput,
  type InventoryPartFormValues,
} from "@/lib/validations/inventory";
import { TextInput } from "@/components/forms/TextInput";
import { FractionQuantityInput } from "@/components/forms/FractionQuantityInput";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { INVENTORY_CATEGORIES, INVENTORY_PART_TYPES, INVENTORY_UNITS } from "@/lib/constants";
import type { InventoryPartClient } from "@/lib/inventory/client";
import { partTypeLabel } from "@/lib/inventory/part-type";
import { updateInventoryPartAction } from "../actions";

interface Props {
  part: InventoryPartClient;
}

export function EditInventoryPartForm({ part }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryPartFormValues, unknown, InventoryPartInput>({
    resolver: zodResolver(inventoryPartSchema),
    defaultValues: {
      sku: part.sku,
      name: part.name,
      description: part.description ?? "",
      category: part.category ?? "",
      partType: part.partType as typeof INVENTORY_PART_TYPES.MATERIAL,
      unit: part.unit,
      quantityOnHand: 0,
      minQuantity: part.minQuantity != null ? formatFractionQuantity(part.minQuantity) : "",
      unitCost: part.unitCost != null ? Number(part.unitCost) : "",
      location: part.location ?? "",
      isActive: part.isActive,
      updatedBy: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateInventoryPartAction(part.id, data);
      if (result.ok) setSaved(true);
      else setSubmitError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <h3 className="font-semibold text-rapid-text">
        Datos de la pieza · {partTypeLabel(part.partType)}
      </h3>
      <input type="hidden" {...register("partType")} />
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      {saved && (
        <p className="text-sm text-rapid-green-dark">Cambios guardados.</p>
      )}

      <datalist id="category-suggestions">
        {INVENTORY_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TextInput
          label="Código *"
          {...register("sku")}
          error={errors.sku?.message}
        />
        <TextInput
          label="Nombre *"
          {...register("name")}
          error={errors.name?.message}
        />
        <TextInput
          label="Categoría"
          list="category-suggestions"
          {...register("category")}
        />
        <div>
          <label className="form-label">Unidad</label>
          <select className="form-input" {...register("unit")}>
            {INVENTORY_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <FractionQuantityInput
          label="Stock mínimo"
          {...register("minQuantity")}
          error={errors.minQuantity?.message}
        />
        <TextInput
          label="Costo unitario"
          type="number"
          step="0.01"
          min="0"
          {...register("unitCost")}
        />
        <TextInput label="Ubicación" {...register("location")} />
        <TextInput label="Actualizado por" {...register("updatedBy")} />
      </div>
      <TextInput label="Descripción" {...register("description")} />
      {part.reservedQuantity > 0 && (
        <p className="text-xs text-amber-700">
          Reservado: {formatFractionQuantity(part.reservedQuantity)} {part.unit}{" "}
          (no editable desde aquí)
        </p>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="rounded" {...register("isActive")} />
        Activa
      </label>
      <p className="text-xs text-rapid-text-muted">
        El stock se modifica solo con movimientos de entrada, salida o ajuste.
      </p>
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
