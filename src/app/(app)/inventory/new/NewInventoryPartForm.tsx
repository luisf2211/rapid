"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, AlertCircle } from "lucide-react";
import {
  inventoryPartSchema,
  type InventoryPartInput,
  type InventoryPartFormValues,
} from "@/lib/validations/inventory";
import { TextInput } from "@/components/forms/TextInput";
import { FractionQuantityInput } from "@/components/forms/FractionQuantityInput";
import { INVENTORY_CATEGORIES, INVENTORY_GALLON_CATEGORIES, INVENTORY_PART_TYPES, INVENTORY_UNITS, SUGGESTED_PARTS } from "@/lib/constants";
import { defaultUnitForPartType } from "@/lib/inventory/part-type";
import type { InventoryPartType } from "@/lib/constants";
import { createInventoryPartAction } from "../actions";

export function NewInventoryPartForm({
  partType = INVENTORY_PART_TYPES.MATERIAL,
}: {
  partType?: InventoryPartType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InventoryPartFormValues, unknown, InventoryPartInput>({
    resolver: zodResolver(inventoryPartSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: partType === INVENTORY_PART_TYPES.PAINT ? "Pintura" : "",
      partType,
      unit: defaultUnitForPartType(partType),
      quantityOnHand: 0,
      minQuantity: "",
      unitCost: "",
      location: "",
      isActive: true,
      createdBy: "",
    },
  });

  const category = useWatch({ control, name: "category" });

  useEffect(() => {
    const cat = category?.trim();
    if (
      partType === INVENTORY_PART_TYPES.MATERIAL &&
      cat &&
      INVENTORY_GALLON_CATEGORIES.some(
        (c) => c.toLowerCase() === cat.toLowerCase(),
      )
    ) {
      setValue("unit", "GL");
    }
  }, [category, partType, setValue]);

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createInventoryPartAction(data);
      if (result.ok) {
        const base =
          result.partType === INVENTORY_PART_TYPES.PAINT
            ? "/inventory/paint"
            : "/inventory";
        router.push(`${base}/${result.id}`);
      } else {
        setSubmitError(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      {submitError && (
        <div className="card border-red-200 bg-red-50 p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <input type="hidden" {...register("partType")} />
      <section className="card p-5 space-y-4">
        <datalist id="part-suggestions">
          {SUGGESTED_PARTS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        <datalist id="category-suggestions">
          {INVENTORY_CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="SKU *"
            {...register("sku")}
            error={errors.sku?.message}
          />
          <TextInput
            label="Nombre *"
            list="part-suggestions"
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
            label="Stock inicial"
            {...register("quantityOnHand")}
            error={errors.quantityOnHand?.message}
          />
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
          <TextInput label="Ubicación" placeholder="Estante, bodega..." {...register("location")} />
          <TextInput label="Registrado por" {...register("createdBy")} />
        </div>
        <TextInput label="Descripción" {...register("description")} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" {...register("isActive")} />
          Pieza activa en inventario
        </label>
      </section>

      <div className="flex gap-2">
        <Link href="/inventory" className="btn-secondary">
          Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="btn-primary">
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Registrar pieza"}
        </button>
      </div>
    </form>
  );
}
