"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";
import { SelectInput } from "@/components/forms/SelectInput";
import { TextAreaInput } from "@/components/forms/TextAreaInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import {
  expenseFormSchema,
  type ExpenseFormValues,
  EXPENSE_PAYMENT_METHODS,
} from "@/lib/validations/expense";
import {
  createExpenseAction,
  updateExpenseAction,
} from "@/app/(app)/expenses/actions";

type BankAccountOption = { Id: number; AccountName: string; BankName: string };

interface Props {
  mode: "create" | "edit";
  expenseId?: number;
  defaultValues: ExpenseFormValues;
  categories?: { Id: number; Name: string; Color: string | null }[];
  bankAccounts: BankAccountOption[];
}

export function ExpenseForm({
  mode,
  expenseId,
  defaultValues,
  bankAccounts,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as never,
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result =
        mode === "edit" && expenseId != null
          ? await updateExpenseAction(expenseId, data)
          : await createExpenseAction(data);
      if (result.ok) {
        router.push("/expenses");
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
        ? "Registrando..."
        : "Registrar gasto";

  const bankOptions = [
    { value: "", label: "Sin cuenta bancaria" },
    ...bankAccounts.map((b) => ({
      value: String(b.Id),
      label: `${b.AccountName} (${b.BankName})`,
    })),
  ];

  const paymentOptions = [
    { value: "", label: "Seleccionar..." },
    ...EXPENSE_PAYMENT_METHODS.map((m) => ({
      value: m.value,
      label: m.label,
    })),
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-12">
      <div className="card sticky top-0 z-10 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 backdrop-blur bg-white/95">
        <span />
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/expenses" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Cancelar</span>
          </Link>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save className="w-4 h-4" />
            {submitLabel}
          </button>
        </div>
      </div>

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
        <div className="mb-4 pb-3 border-b border-rapid-border">
          <h2 className="font-bold text-lg">Información del gasto</h2>
          <p className="text-sm text-rapid-text-muted">
            Registra los detalles del gasto operativo
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextInput
            label="Categoría *"
            placeholder="Comida, combustible, herramientas..."
            {...register("categoryId")}
            error={errors.categoryId?.message}
          />
          <TextInput
            label="Fecha *"
            type="date"
            {...register("expenseDate")}
            error={errors.expenseDate?.message}
          />
          <MoneyInput
            label="Monto *"
            {...register("amount")}
            error={errors.amount?.message}
          />
          <TextInput
            label="Descripción *"
            placeholder="Almuerzo del equipo, tornillos, etc."
            containerClassName="md:col-span-2 lg:col-span-3"
            {...register("description")}
            error={errors.description?.message}
          />
          <TextInput
            label="Proveedor"
            placeholder="Nombre del proveedor"
            {...register("supplier")}
            error={errors.supplier?.message}
          />
          <SelectInput
            label="Método de pago"
            options={paymentOptions}
            {...register("paymentMethod")}
            error={errors.paymentMethod?.message}
          />
          <SelectInput
            label="Cuenta bancaria"
            options={bankOptions}
            {...register("bankAccountId")}
            error={errors.bankAccountId?.message}
          />
          <TextInput
            label="Referencia"
            placeholder="No. factura, recibo..."
            {...register("reference")}
            error={errors.reference?.message}
          />
        </div>
        <div className="mt-4">
          <TextAreaInput
            label="Notas"
            placeholder="Notas adicionales..."
            rows={3}
            {...register("notes")}
            error={errors.notes?.message}
          />
        </div>
      </section>
    </form>
  );
}
