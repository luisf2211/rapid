"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, Wrench } from "lucide-react";
import {
  laborOrderSchema,
  type LaborOrderInput,
  type LaborOrderFormValues,
} from "@/lib/validations/labor-order";
import { TextInput } from "@/components/forms/TextInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { SUGGESTED_PARTS } from "@/lib/constants";
import { formatMoney } from "@/lib/formatters/money";
import { createLaborOrderAction } from "../actions";

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

export function NewLaborOrderForm({
  workOrders,
  initialWorkOrderId,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LaborOrderFormValues, unknown, LaborOrderInput>({
    resolver: zodResolver(laborOrderSchema),
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
          partName: "",
          desabCost: 0,
          disassemblerCost: 0,
          prepCost: 0,
          painterCost: 0,
          polisherCost: 0,
          total: 0,
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

  const totals = useMemo(() => {
    if (!watched)
      return {
        dent: 0,
        dis: 0,
        prep: 0,
        paint: 0,
        polish: 0,
        total: 0,
      };
    return watched.reduce(
      (acc, it) => {
        const d = Number(it?.desabCost) || 0;
        const ds = Number(it?.disassemblerCost) || 0;
        const pp = Number(it?.prepCost) || 0;
        const pt = Number(it?.painterCost) || 0;
        const pl = Number(it?.polisherCost) || 0;
        return {
          dent: acc.dent + d,
          dis: acc.dis + ds,
          prep: acc.prep + pp,
          paint: acc.paint + pt,
          polish: acc.polish + pl,
          total: acc.total + d + ds + pp + pt + pl,
        };
      },
      { dent: 0, dis: 0, prep: 0, paint: 0, polish: 0, total: 0 },
    );
  }, [watched]);

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createLaborOrderAction(data);
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
              No se pudo guardar la orden
            </p>
            <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <section className="card p-5">
        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-rapid-border">
          <div className="w-10 h-10 rounded-xl bg-rapid-black text-rapid-green flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Cabecera de mano de obra</h2>
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

      {/* Piezas */}
      <section className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-lg">Piezas y costos</h2>
            <p className="text-sm text-rapid-text-muted">
              Costo desglosado por tipo de trabajo en cada pieza.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() =>
              items.append({
                partName: "",
                desabCost: 0,
                disassemblerCost: 0,
                prepCost: 0,
                painterCost: 0,
                polisherCost: 0,
                total: 0,
              })
            }
          >
            <Plus className="w-4 h-4" /> Agregar pieza
          </button>
        </div>

        <datalist id="parts-suggestions">
          {SUGGESTED_PARTS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        <div className="space-y-3">
          {items.fields.map((field, idx) => {
            const w = watched?.[idx];
            const line =
              (Number(w?.desabCost) || 0) +
              (Number(w?.disassemblerCost) || 0) +
              (Number(w?.prepCost) || 0) +
              (Number(w?.painterCost) || 0) +
              (Number(w?.polisherCost) || 0);
            return (
              <div
                key={field.id}
                className="p-3 rounded-lg bg-rapid-bg/50 border border-rapid-border"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <TextInput
                    label="Pieza *"
                    placeholder="Bomper delantero..."
                    list="parts-suggestions"
                    containerClassName="sm:col-span-4"
                    {...register(`items.${idx}.partName`)}
                    error={errors.items?.[idx]?.partName?.message}
                  />
                  <MoneyInput
                    label="Desabolladura"
                    containerClassName="sm:col-span-2"
                    {...register(`items.${idx}.desabCost`)}
                  />
                  <MoneyInput
                    label="Desarme"
                    containerClassName="sm:col-span-2"
                    {...register(`items.${idx}.disassemblerCost`)}
                  />
                  <MoneyInput
                    label="Preparación"
                    containerClassName="sm:col-span-2"
                    {...register(`items.${idx}.prepCost`)}
                  />
                  <div className="sm:col-span-2 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => items.remove(idx)}
                      disabled={items.fields.length === 1}
                      className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <MoneyInput
                    label="Pintura"
                    containerClassName="sm:col-span-2"
                    {...register(`items.${idx}.painterCost`)}
                  />
                  <MoneyInput
                    label="Pulido"
                    containerClassName="sm:col-span-2"
                    {...register(`items.${idx}.polisherCost`)}
                  />
                  <div className="sm:col-span-8">
                    <label className="form-label">Total de la pieza</label>
                    <div className="form-input bg-white text-right tabular-nums font-bold text-rapid-green-dark text-base">
                      {formatMoney(line)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {errors.items?.message && (
          <p className="mt-2 text-xs text-red-600">{errors.items.message}</p>
        )}
      </section>

      {/* Subtotales */}
      <section className="card p-5">
        <h2 className="font-bold text-lg mb-3">Subtotales por área</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SubBox label="Desabolladura" value={totals.dent} />
          <SubBox label="Desarme" value={totals.dis} />
          <SubBox label="Preparación" value={totals.prep} />
          <SubBox label="Pintura" value={totals.paint} />
          <SubBox label="Pulido" value={totals.polish} />
        </div>
      </section>

      {/* Total flotante */}
      <div className="card sticky bottom-4 lg:bottom-2 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
            Total mano de obra
          </p>
          <p className="text-3xl font-bold text-rapid-green-dark">
            {formatMoney(totals.total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/labor-orders" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || workOrders.length === 0}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Guardando..." : "Guardar mano de obra"}
          </button>
        </div>
      </div>
    </form>
  );
}

function SubBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-rapid-border bg-rapid-bg/40 p-3">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-rapid-text-muted">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums mt-0.5">
        {formatMoney(value)}
      </p>
    </div>
  );
}
