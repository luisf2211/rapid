"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Boxes,
  Package,
} from "lucide-react";
import {
  materialRequisitionSchema,
  type MaterialRequisitionInput,
  type MaterialRequisitionFormValues,
} from "@/lib/validations/material-requisition";
import type { InventoryPartOption } from "@/lib/inventory/client";
import { TextInput } from "@/components/forms/TextInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { formatMoney } from "@/lib/formatters/money";
import { createMaterialRequisitionAction } from "../actions";

interface WorkOrderOption {
  id: number;
  orderNumber: number;
  customerName: string;
  brand: string;
  model: string;
  plate: string;
}

interface Props {
  workOrders: WorkOrderOption[];
  inventoryParts: InventoryPartOption[];
  initialWorkOrderId?: number;
}

const emptyLine = () => ({
  inventoryPartId: 0,
  quantity: 1,
  unitPrice: 0,
  assignedEmployee: "",
});

export function NewMaterialRequisitionForm({
  workOrders,
  inventoryParts,
  initialWorkOrderId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const partById = useMemo(
    () => new Map(inventoryParts.map((p) => [p.id, p])),
    [inventoryParts],
  );

  const form = useForm<
    MaterialRequisitionFormValues,
    unknown,
    MaterialRequisitionInput
  >({
    resolver: zodResolver(materialRequisitionSchema),
    mode: "onBlur",
    defaultValues: {
      workOrderId: initialWorkOrderId ?? workOrders[0]?.id ?? 0,
      items: [emptyLine()],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  const items = useFieldArray({ control, name: "items" });
  const watched = useWatch({ control, name: "items" });

  const total = useMemo(() => {
    if (!watched) return 0;
    return watched.reduce(
      (acc, it) =>
        acc + (Number(it?.quantity) || 0) * (Number(it?.unitPrice) || 0),
      0,
    );
  }, [watched]);

  const onPartChange = (idx: number, partId: number) => {
    const part = partById.get(partId);
    if (!part) return;
    setValue(`items.${idx}.inventoryPartId`, partId, { shouldValidate: true });
    if (part.unitCost != null) {
      setValue(`items.${idx}.unitPrice`, part.unitCost);
    }
  };

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createMaterialRequisitionAction(data);
      if (result.ok) {
        router.push(`/work-orders/${result.workOrderId}`);
      } else {
        setSubmitError(result.error);
      }
    });
  });

  if (inventoryParts.length === 0) {
    return (
      <div className="card p-10 text-center">
        <Package className="w-10 h-10 text-rapid-text-muted mx-auto mb-3" />
        <p className="font-semibold text-rapid-text">Sin piezas en inventario</p>
        <p className="text-sm text-rapid-text-muted mt-1 max-w-md mx-auto">
          Registra piezas en inventario antes de crear una requisición de
          materiales.
        </p>
        <Link href="/inventory/new" className="btn-primary mt-4 inline-flex">
          <Plus className="w-4 h-4" /> Registrar pieza
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-12">
      {submitError && (
        <div className="card border-red-200 bg-red-50 p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              No se pudo guardar la requisición
            </p>
            <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <section className="card p-5">
        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-rapid-border">
          <div className="w-10 h-10 rounded-xl bg-rapid-green-soft text-rapid-green-dark flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Cabecera de la requisición</h2>
            <p className="text-sm text-rapid-text-muted">
              Orden de recepción vinculada
            </p>
          </div>
        </div>

        <Controller
          control={control}
          name="workOrderId"
          render={({ field }) => (
            <div>
              <label className="form-label">Orden relacionada *</label>
              <select
                name={field.name}
                ref={field.ref}
                value={field.value != null ? String(field.value) : ""}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="form-input"
                disabled={workOrders.length === 0}
              >
                {workOrders.length === 0 && (
                  <option value="">No hay órdenes disponibles</option>
                )}
                {workOrders.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    #{String(wo.orderNumber).padStart(5, "0")} ·{" "}
                    {wo.customerName} · {wo.brand} {wo.model} ({wo.plate})
                  </option>
                ))}
              </select>
              {errors.workOrderId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.workOrderId.message}
                </p>
              )}
            </div>
          )}
        />
      </section>

      <section className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-lg">Materiales del inventario</h2>
            <p className="text-sm text-rapid-text-muted">
              Cada línea descuenta stock al guardar (salida automática).
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => items.append(emptyLine())}
          >
            <Plus className="w-4 h-4" /> Agregar línea
          </button>
        </div>

        <div className="space-y-3">
          {items.fields.map((field, idx) => {
            const partId = Number(watched?.[idx]?.inventoryPartId);
            const part = partId ? partById.get(partId) : undefined;
            const q = Number(watched?.[idx]?.quantity ?? 0);
            const p = Number(watched?.[idx]?.unitPrice ?? 0);
            const lineTotal = q * p;
            const overStock = part != null && q > part.available;

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-lg bg-rapid-bg/50 border border-rapid-border"
              >
                <div className="sm:col-span-4">
                  <label className="form-label">Pieza del inventario *</label>
                  <Controller
                    control={control}
                    name={`items.${idx}.inventoryPartId`}
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
                        <option value="">Seleccionar pieza...</option>
                        {inventoryParts.map((inv) => {
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
                              {inv.sku} · {inv.name} (disp. {inv.available}{" "}
                              {inv.unit})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {errors.items?.[idx]?.inventoryPartId && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[idx]?.inventoryPartId?.message}
                    </p>
                  )}
                  {part && (
                    <p className="mt-1 text-xs text-rapid-text-muted">
                      Disponible: {part.available} {part.unit}
                      {part.category ? ` · ${part.category}` : ""}
                    </p>
                  )}
                  {overStock && (
                    <p className="mt-1 text-xs text-red-600">
                      Cantidad mayor al stock disponible
                    </p>
                  )}
                </div>
                <TextInput
                  label="Cantidad"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={part ? part.available : undefined}
                  containerClassName="sm:col-span-2"
                  {...register(`items.${idx}.quantity`)}
                  error={errors.items?.[idx]?.quantity?.message}
                />
                <MoneyInput
                  label="Precio unitario"
                  containerClassName="sm:col-span-2"
                  {...register(`items.${idx}.unitPrice`)}
                />
                <div className="sm:col-span-2">
                  <label className="form-label">Total</label>
                  <div className="form-input bg-white text-right tabular-nums font-semibold text-rapid-green-dark">
                    {formatMoney(lineTotal)}
                  </div>
                </div>
                <TextInput
                  label="Asignado a"
                  placeholder="Empleado"
                  containerClassName="sm:col-span-1"
                  {...register(`items.${idx}.assignedEmployee`)}
                />
                <div className="sm:col-span-1 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => items.remove(idx)}
                    disabled={items.fields.length === 1}
                    className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {errors.items?.message && (
          <p className="mt-2 text-xs text-red-600">{errors.items.message}</p>
        )}
      </section>

      <div className="card sticky bottom-4 lg:bottom-2 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="text-xs text-rapid-text-muted">Total de la requisición</p>
          <p className="text-3xl font-bold text-rapid-green-dark">
            {formatMoney(total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/material-requisitions" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || workOrders.length === 0}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Guardando..." : "Guardar requisición"}
          </button>
        </div>
      </div>
    </form>
  );
}
