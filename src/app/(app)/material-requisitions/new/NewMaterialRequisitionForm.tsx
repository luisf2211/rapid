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
} from "lucide-react";
import {
  materialRequisitionSchema,
  type MaterialRequisitionInput,
  type MaterialRequisitionFormValues,
} from "@/lib/validations/material-requisition";
import { TextInput } from "@/components/forms/TextInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { SUGGESTED_MATERIALS } from "@/lib/constants";
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
  initialWorkOrderId?: number;
}

export function NewMaterialRequisitionForm({
  workOrders,
  initialWorkOrderId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<
    MaterialRequisitionFormValues,
    unknown,
    MaterialRequisitionInput
  >({
    resolver: zodResolver(materialRequisitionSchema),
    mode: "onBlur",
    defaultValues: {
      workOrderId: initialWorkOrderId ?? workOrders[0]?.id ?? 0,
      desab: "",
      disassembler: "",
      prep: "",
      painter: "",
      polisher: "",
      items: [
        {
          productName: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          assignedEmployee: "",
        },
      ],
    },
  });

  const {
    register,
    handleSubmit,
    control,
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

      {/* Cabecera */}
      <section className="card p-5">
        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-rapid-border">
          <div className="w-10 h-10 rounded-xl bg-rapid-green-soft text-rapid-green-dark flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Cabecera de la requisición</h2>
            <p className="text-sm text-rapid-text-muted">
              Orden relacionada y empleados asignados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="workOrderId"
            render={({ field }) => (
              <div className="md:col-span-2">
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
          <TextInput
            label="Desabollador"
            {...register("desab")}
            error={errors.desab?.message}
          />
          <TextInput
            label="Desarme"
            {...register("disassembler")}
            error={errors.disassembler?.message}
          />
          <TextInput
            label="Preparador"
            {...register("prep")}
            error={errors.prep?.message}
          />
          <TextInput
            label="Pintor"
            {...register("painter")}
            error={errors.painter?.message}
          />
          <TextInput
            label="Pulidor"
            {...register("polisher")}
            error={errors.polisher?.message}
            containerClassName="md:col-span-2"
          />
        </div>
      </section>

      {/* Items */}
      <section className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-lg">Materiales</h2>
            <p className="text-sm text-rapid-text-muted">
              Agrega los productos requeridos. Los totales se calculan
              automáticamente.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() =>
              items.append({
                productName: "",
                quantity: 1,
                unitPrice: 0,
                total: 0,
                assignedEmployee: "",
              })
            }
          >
            <Plus className="w-4 h-4" /> Agregar material
          </button>
        </div>

        <datalist id="materials-suggestions">
          {SUGGESTED_MATERIALS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>

        <div className="space-y-3">
          {items.fields.map((field, idx) => {
            const q = Number(watched?.[idx]?.quantity ?? 0);
            const p = Number(watched?.[idx]?.unitPrice ?? 0);
            const lineTotal = q * p;
            return (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-lg bg-rapid-bg/50 border border-rapid-border"
              >
                <TextInput
                  label="Producto *"
                  placeholder="Lija, Pintura base..."
                  list="materials-suggestions"
                  containerClassName="sm:col-span-4"
                  {...register(`items.${idx}.productName`)}
                  error={errors.items?.[idx]?.productName?.message}
                />
                <TextInput
                  label="Cantidad"
                  type="number"
                  step="0.01"
                  min="0"
                  containerClassName="sm:col-span-1"
                  {...register(`items.${idx}.quantity`)}
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
                  containerClassName="sm:col-span-2"
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

      {/* Total flotante */}
      <div className="card sticky bottom-4 lg:bottom-2 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
            Total de la requisición
          </p>
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
