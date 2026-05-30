"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import { INVENTORY_CATEGORIES, INVENTORY_UNITS, SUGGESTED_PARTS } from "@/lib/constants";
import { createInventoryPartAction } from "../actions";

export function NewInventoryPartForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryPartFormValues, unknown, InventoryPartInput>({
    resolver: zodResolver(inventoryPartSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "",
      unit: "PZ",
      quantityOnHand: 0,
      minQuantity: "",
      unitCost: "",
      location: "",
      isActive: true,
      createdBy: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createInventoryPartAction(data);
      if (result.ok) {
        router.push(`/inventory/${result.id}`);
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
          <TextInput
            label="Stock inicial"
            type="number"
            step="0.01"
            min="0"
            {...register("quantityOnHand")}
          />
          <TextInput
            label="Stock mínimo"
            type="number"
            step="0.01"
            min="0"
            {...register("minQuantity")}
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
