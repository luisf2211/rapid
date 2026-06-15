"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, Wrench } from "lucide-react";
import {
  laborOrderSchema,
  laborLineAmountFromInput,
  type LaborOrderInput,
  type LaborOrderFormValues,
} from "@/lib/validations/labor-order";
import { SUGGESTED_PARTS } from "@/lib/constants";
import { formatMoney } from "@/lib/formatters/money";
import {
  computeLaborLineAmount,
  formatPieceCount,
  sumLaborOrderAmount,
  sumLaborOrderPieces,
} from "@/lib/labor-order/piece-count";
import {
  createLaborOrderAction,
  updateLaborOrderAction,
} from "@/app/(app)/labor-orders/actions";

export interface WorkOrderOption {
  id: number;
  orderNumber: number;
  customerName: string;
  brand: string;
  model: string;
  plate: string;
}

export interface EmployeeOption {
  id: number;
  name: string;
  role: string;
  defaultUnitPrice: number;
}

const emptyLine = (unitPrice = 0) => ({
  partName: "",
  quantity: 1,
  unitPrice,
});

interface Props {
  mode: "create" | "edit";
  laborOrderId?: number;
  defaultValues: LaborOrderFormValues;
  workOrders: WorkOrderOption[];
  employees: EmployeeOption[];
  lockWorkOrder?: boolean;
  cancelHref: string;
}

export function LaborOrderForm({
  mode,
  laborOrderId,
  defaultValues,
  workOrders,
  employees,
  lockWorkOrder = false,
  cancelHref,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LaborOrderFormValues, unknown, LaborOrderInput>({
    resolver: zodResolver(laborOrderSchema),
    mode: "onBlur",
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const items = useFieldArray({ control, name: "items" });
  const watched = useWatch({ control, name: "items" });
  const watchedEmployeeId = useWatch({ control, name: "employeeId" });

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === Number(watchedEmployeeId)),
    [employees, watchedEmployeeId],
  );

  const defaultUnitPrice = selectedEmployee?.defaultUnitPrice ?? 0;

  const appendLine = useCallback(() => {
    items.append(emptyLine(defaultUnitPrice));
  }, [items, defaultUnitPrice]);

  const { totalPieces, totalAmount } = useMemo(() => {
    if (!watched?.length) return { totalPieces: 0, totalAmount: 0 };
    const normalized = watched.map((it) => ({
      quantity: Number(it?.quantity ?? 0),
      unitPrice: Number(it?.unitPrice ?? 0),
      total: computeLaborLineAmount(
        Number(it?.quantity ?? 0),
        Number(it?.unitPrice ?? 0),
      ),
    }));
    return {
      totalPieces: sumLaborOrderPieces(normalized),
      totalAmount: sumLaborOrderAmount(normalized),
    };
  }, [watched]);

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result =
        mode === "edit" && laborOrderId != null
          ? await updateLaborOrderAction(laborOrderId, data)
          : await createLaborOrderAction(data);
      if (result.ok) {
        router.push(`/labor-orders/${result.id}`);
      } else {
        setSubmitError(result.error);
      }
    });
  });

  const submitLabel =
    mode === "edit"
      ? isPending
        ? "Guardando..."
        : "Guardar cambios"
      : isPending
        ? "Guardando..."
        : "Guardar mano de obra";

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-12">
      {submitError && (
        <div className="card border-red-200 bg-red-50 p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              No se pudo guardar
            </p>
            <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <section className="card p-5">
        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-rapid-border">
          <div className="w-10 h-10 rounded-xl bg-rapid-black text-rapid-green flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Técnico</h2>
            <p className="text-sm text-rapid-text-muted">
              Una orden por trabajador. Anota piezas, cantidad y precio por
              pieza — el total en $ se calcula automáticamente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="workOrderId"
            render={({ field }) => (
              <div className="md:col-span-2">
                <label className="form-label">Orden de recepción *</label>
                <select
                  name={field.name}
                  ref={field.ref}
                  value={field.value != null ? String(field.value) : ""}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="form-input"
                  disabled={workOrders.length === 0 || lockWorkOrder}
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
          <Controller
            control={control}
            name="employeeId"
            render={({ field }) => (
              <div className="md:col-span-2">
                <label className="form-label">Empleado / técnico *</label>
                <select
                  name={field.name}
                  ref={field.ref}
                  value={field.value != null ? String(field.value) : ""}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="form-input"
                  disabled={employees.length === 0}
                >
                  {employees.length === 0 && (
                    <option value="">Registra empleados primero</option>
                  )}
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {`${emp.role} — ${emp.name}`}
                      {emp.defaultUnitPrice > 0
                        ? ` · ${formatMoney(emp.defaultUnitPrice)}/pza`
                        : ""}
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.employeeId.message}
                  </p>
                )}
                {employees.length === 0 && (
                  <p className="text-xs text-rapid-text-muted mt-1">
                    <Link href="/employees/new" className="text-rapid-green-dark hover:underline">
                      Crear empleado
                    </Link>
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-lg">Piezas trabajadas</h2>
            <p className="text-sm text-rapid-text-muted">
              Nombre de pieza, cantidad y precio por pieza para este técnico.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => appendLine()}
          >
            <Plus className="w-4 h-4" /> Agregar pieza
          </button>
        </div>

        <datalist id="parts-suggestions">
          {SUGGESTED_PARTS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-rapid-text-muted">
              <tr>
                <th className="text-left font-semibold pb-2 pr-3">
                  Nombre de pieza *
                </th>
                <th className="text-right font-semibold pb-2 w-24">
                  Cantidad *
                </th>
                <th className="text-right font-semibold pb-2 w-28">
                  Precio/pieza
                </th>
                <th className="text-right font-semibold pb-2 w-28">
                  Total
                </th>
                <th className="w-10 pb-2" />
              </tr>
            </thead>
            <tbody>
              {items.fields.map((field, idx) => {
                const row = watched?.[idx];
                const lineTotal = row
                  ? laborLineAmountFromInput({
                      partName: row.partName ?? "",
                      quantity: Number(row.quantity ?? 0),
                      unitPrice: Number(row.unitPrice ?? 0),
                    })
                  : 0;
                return (
                  <tr key={field.id} className="border-t border-rapid-border">
                    <td className="py-2 pr-3 align-top">
                      <input
                        list="parts-suggestions"
                        className="form-input w-full"
                        placeholder="Bomper delantero..."
                        {...register(`items.${idx}.partName`)}
                      />
                      {errors.items?.[idx]?.partName && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.items[idx]?.partName?.message}
                        </p>
                      )}
                    </td>
                    <td className="py-2 align-top">
                      <input
                        type="number"
                        min={0.01}
                        step="any"
                        className="form-input w-full text-right font-mono"
                        {...register(`items.${idx}.quantity`)}
                      />
                      {errors.items?.[idx]?.quantity && (
                        <p className="text-xs text-red-600 mt-1 text-right">
                          {errors.items[idx]?.quantity?.message}
                        </p>
                      )}
                    </td>
                    <td className="py-2 align-top">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="form-input w-full text-right font-mono"
                        placeholder="0.00"
                        {...register(`items.${idx}.unitPrice`)}
                      />
                      {errors.items?.[idx]?.unitPrice && (
                        <p className="text-xs text-red-600 mt-1 text-right">
                          {errors.items[idx]?.unitPrice?.message}
                        </p>
                      )}
                    </td>
                    <td className="py-2 align-top text-right font-mono font-semibold tabular-nums text-rapid-green-dark">
                      {formatMoney(lineTotal)}
                    </td>
                    <td className="py-2 align-top text-right">
                      <button
                        type="button"
                        onClick={() => items.remove(idx)}
                        disabled={items.fields.length === 1}
                        className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                        aria-label="Eliminar pieza"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {errors.items?.message && (
          <p className="mt-2 text-xs text-red-600">{errors.items.message}</p>
        )}
      </section>

      <div className="card sticky bottom-4 lg:bottom-2 p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Total piezas
            </p>
            <p className="text-2xl font-bold text-rapid-text tabular-nums">
              {formatPieceCount(totalPieces)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Total a pagar
            </p>
            <p className="text-2xl font-bold text-rapid-green-dark tabular-nums">
              {formatMoney(totalAmount)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={cancelHref} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || workOrders.length === 0 || employees.length === 0}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
