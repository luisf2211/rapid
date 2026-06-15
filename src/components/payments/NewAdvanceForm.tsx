"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import {
  advancePaymentSchema,
  type AdvancePaymentInput,
  type AdvancePaymentFormValues,
} from "@/lib/validations/employee";
import { PAYMENT_METHODS } from "@/lib/constants";
import {
  createAdvanceAction,
  getEmployeeLaborWorkLinesAction,
} from "@/app/(app)/employees/actions";
import { employeeDisplayName } from "@/lib/employee/display";
import type { EmployeeLaborWorkLine } from "@/lib/employee/labor-work";
import { sumSelectedWorkAmount } from "@/lib/employee/labor-work";
import { formatMoney } from "@/lib/formatters/money";
import { formatDate } from "@/lib/formatters/date";
import { formatPieceCount } from "@/lib/labor-order/piece-count";

type EmployeeOption = {
  Id: number;
  Name: string;
  Role: string;
};

interface Props {
  employees: EmployeeOption[];
  initialEmployeeId?: number;
  defaultPaymentDate: string;
}

export function NewAdvanceForm({
  employees,
  initialEmployeeId,
  defaultPaymentDate,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workLines, setWorkLines] = useState<EmployeeLaborWorkLine[]>([]);
  const [loadingWork, setLoadingWork] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdvancePaymentFormValues, unknown, AdvancePaymentInput>({
    resolver: zodResolver(advancePaymentSchema),
    defaultValues: {
      employeeId: initialEmployeeId ?? employees[0]?.Id ?? 0,
      amount: 0,
      paymentDate: defaultPaymentDate,
      paymentMethod: "EFECTIVO",
      reference: "",
      notes: "",
      paidBy: "Taller",
      laborOrderItemIds: [],
    },
  });

  const employeeId = watch("employeeId");
  const amount = watch("amount");

  useEffect(() => {
    const id = Number(employeeId);
    if (!Number.isFinite(id) || id <= 0) {
      setWorkLines([]);
      setSelectedItemIds([]);
      return;
    }

    let cancelled = false;
    setLoadingWork(true);
    setLoadError(null);
    setSelectedItemIds([]);
    setValue("laborOrderItemIds", []);

    void getEmployeeLaborWorkLinesAction(id).then((result) => {
      if (cancelled) return;
      setLoadingWork(false);
      if (!result.ok) {
        setLoadError(result.error);
        setWorkLines([]);
        return;
      }
      setWorkLines(result.lines);
    });

    return () => {
      cancelled = true;
    };
  }, [employeeId, setValue]);

  const availableLines = workLines.filter((l) => !l.alreadyInAdvance);
  const selectedTotal = sumSelectedWorkAmount(workLines, selectedItemIds);

  function toggleLine(itemId: number, checked: boolean) {
    setSelectedItemIds((prev) => {
      const next = checked
        ? [...prev, itemId]
        : prev.filter((id) => id !== itemId);
      setValue("laborOrderItemIds", next, { shouldValidate: true });
      if (checked && (Number(amount) === 0 || !amount)) {
        const line = workLines.find((l) => l.laborOrderItemId === itemId);
        if (line) {
          setValue("amount", sumSelectedWorkAmount(workLines, next), {
            shouldValidate: true,
          });
        }
      }
      return next;
    });
  }

  function selectAllAvailable() {
    const ids = availableLines.map((l) => l.laborOrderItemId);
    setSelectedItemIds(ids);
    setValue("laborOrderItemIds", ids, { shouldValidate: true });
    const total = sumSelectedWorkAmount(workLines, ids);
    if (total > 0) {
      setValue("amount", total, { shouldValidate: true });
    }
  }

  function clearSelection() {
    setSelectedItemIds([]);
    setValue("laborOrderItemIds", [], { shouldValidate: true });
  }

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createAdvanceAction({
        ...data,
        laborOrderItemIds: selectedItemIds,
      });
      if (result.ok) {
        router.push(`/print/payments/${result.id}?auto=1`);
      } else {
        setSubmitError(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
      {submitError && (
        <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          {submitError}
        </div>
      )}

      <section className="card p-5 space-y-4">
        <div>
          <label className="form-label">Empleado *</label>
          <select className="form-input w-full" {...register("employeeId")}>
            {employees.map((e) => (
              <option key={e.Id} value={e.Id}>
                {employeeDisplayName(e)}
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <p className="text-xs text-red-600 mt-1">{errors.employeeId.message}</p>
          )}
        </div>
        <div>
          <label className="form-label">Monto *</label>
          <input
            type="number"
            step="0.01"
            min={0.01}
            className="form-input w-full font-mono"
            {...register("amount")}
          />
          {selectedTotal > 0 && (
            <p className="text-xs text-rapid-text-muted mt-1">
              Total piezas seleccionadas: {formatMoney(selectedTotal)}
            </p>
          )}
          {errors.amount && (
            <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>
          )}
        </div>
        <div>
          <label className="form-label">Fecha *</label>
          <input type="date" className="form-input w-full" {...register("paymentDate")} />
        </div>
        <div>
          <label className="form-label">Forma de pago</label>
          <select className="form-input w-full" {...register("paymentMethod")}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Referencia</label>
          <input className="form-input w-full" {...register("reference")} />
        </div>
        <div>
          <label className="form-label">Notas</label>
          <textarea className="form-input w-full min-h-[70px]" {...register("notes")} />
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-rapid-border bg-rapid-bg/50 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold">Trabajo realizado</h2>
            <p className="text-xs text-rapid-text-muted mt-0.5">
              Selecciona las piezas de OR/MO que respaldan este anticipo. Aparecerán en el comprobante impreso.
            </p>
          </div>
          {availableLines.length > 0 && (
            <div className="flex gap-2 text-xs">
              <button type="button" className="btn-secondary py-1 px-2" onClick={selectAllAvailable}>
                Seleccionar todo
              </button>
              <button type="button" className="btn-secondary py-1 px-2" onClick={clearSelection}>
                Limpiar
              </button>
            </div>
          )}
        </div>

        {loadingWork ? (
          <p className="p-5 text-sm text-rapid-text-muted flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando mano de obra del empleado…
          </p>
        ) : loadError ? (
          <p className="p-5 text-sm text-red-700">{loadError}</p>
        ) : workLines.length === 0 ? (
          <p className="p-5 text-sm text-rapid-text-muted">
            Este empleado no tiene órdenes de mano de obra registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rapid-bg/30 text-xs uppercase text-rapid-text-muted">
                <tr>
                  <th className="px-4 py-2 text-left w-10" />
                  <th className="px-4 py-2 text-left">Orden / MO</th>
                  <th className="px-4 py-2 text-left">Pieza</th>
                  <th className="px-4 py-2 text-left">Vehículo</th>
                  <th className="px-4 py-2 text-right">Cant.</th>
                  <th className="px-4 py-2 text-right">Precio</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rapid-border">
                {workLines.map((line) => {
                  const disabled = line.alreadyInAdvance;
                  const checked = selectedItemIds.includes(line.laborOrderItemId);
                  return (
                    <tr
                      key={line.laborOrderItemId}
                      className={disabled ? "opacity-50 bg-rapid-bg/20" : undefined}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) =>
                            toggleLine(line.laborOrderItemId, e.target.checked)
                          }
                          aria-label={`Incluir ${line.partName}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-mono text-xs">
                          OR-{String(line.workOrderNumber).padStart(5, "0")}
                        </div>
                        <div className="font-mono text-xs text-rapid-text-muted">
                          MO-{String(line.laborOrderNumber ?? line.laborOrderId).padStart(5, "0")}
                        </div>
                        <div className="text-xs text-rapid-text-muted">
                          {formatDate(line.workedAt)}
                        </div>
                        {disabled && (
                          <span className="text-[10px] uppercase font-semibold text-amber-700">
                            Ya en anticipo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">{line.partName}</td>
                      <td className="px-4 py-2 text-xs text-rapid-text-muted">
                        {line.plate ?? "—"}
                        {line.customerName && (
                          <div>{line.customerName}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatPieceCount(line.quantity)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatMoney(line.unitPrice)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-rapid-green-dark">
                        {formatMoney(line.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex gap-2">
        <Link href="/payments" className="btn-secondary">
          Cancelar
        </Link>
        <button type="submit" disabled={isPending || employees.length === 0} className="btn-primary">
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Registrar e imprimir"}
        </button>
      </div>
    </form>
  );
}
