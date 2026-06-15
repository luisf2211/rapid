"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, AlertCircle } from "lucide-react";
import {
  employeeSchema,
  type EmployeeInput,
  type EmployeeFormValues,
} from "@/lib/validations/employee";
import { TextInput } from "@/components/forms/TextInput";
import { LABOR_TECHNICIAN_ROLES } from "@/lib/constants";
import {
  createEmployeeAction,
  updateEmployeeAction,
} from "@/app/(app)/employees/actions";

interface Props {
  mode: "create" | "edit";
  employeeId?: number;
  defaultValues: EmployeeFormValues;
  cancelHref: string;
}

export function EmployeeForm({
  mode,
  employeeId,
  defaultValues,
  cancelHref,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues, unknown, EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result =
        mode === "edit" && employeeId != null
          ? await updateEmployeeAction(employeeId, data)
          : await createEmployeeAction(data);
      if (result.ok) {
        router.push(`/employees/${result.id}`);
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
        <TextInput
          label="Nombre *"
          error={errors.name?.message}
          {...register("name")}
        />
        <div>
          <label className="form-label">Rol / especialidad *</label>
          <select className="form-input w-full" {...register("role")}>
            <option value="">Seleccionar...</option>
            {LABOR_TECHNICIAN_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Teléfono"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextInput
            label="Cédula / ID"
            error={errors.nationalId?.message}
            {...register("nationalId")}
          />
        </div>
        <TextInput
          label="Tarifa por pieza (predeterminada)"
          type="number"
          step="0.01"
          min={0}
          error={errors.defaultUnitPrice?.message}
          {...register("defaultUnitPrice")}
        />
        <TextInput
          label="Fecha ingreso"
          type="date"
          error={errors.hiredAt?.message}
          {...register("hiredAt")}
        />
        <div>
          <label className="form-label">Notas</label>
          <textarea className="form-input w-full min-h-[80px]" {...register("notes")} />
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" {...register("isExternal")} />
            Externo / subcontratado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" {...register("isActive")} />
            Activo
          </label>
        </div>
      </section>

      <div className="flex gap-2">
        <Link href={cancelHref} className="btn-secondary">
          Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="btn-primary">
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : mode === "edit" ? "Guardar" : "Crear empleado"}
        </button>
      </div>
    </form>
  );
}
