"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateInvoiceSchema,
  type UpdateInvoiceInput,
} from "@/lib/validations/invoice";
import {
  INVOICE_LINE_TYPE_LABELS,
  INVOICE_LINE_TYPES,
} from "@/lib/constants";
import { computeInvoiceTotals, invoiceTaxRate } from "@/lib/invoice/totals";
import { formatMoney } from "@/lib/formatters/money";
import { updateInvoiceAction } from "../../actions";

const defaultLine = {
  lineType: "LABOR" as const,
  description: "",
  quantity: 1,
  unitPrice: 0,
};

export function EditInvoiceForm({
  initialValues,
  orderNumber,
}: {
  initialValues: UpdateInvoiceInput;
  orderNumber: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(updateInvoiceSchema),
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watched = useWatch({ control: form.control });
  const billingType = watched.billingType ?? "PRIVATE";
  const discountAmount = Number(watched.discountAmount) || 0;

  const previewTotals = useMemo(() => {
    const lines = watched.lines ?? [];
    const laborSubtotal = lines
      .filter((l) => l?.lineType === "LABOR")
      .reduce(
        (s, l) =>
          s + (Number(l?.quantity) || 0) * (Number(l?.unitPrice) || 0),
        0,
      );
    const materialSubtotal = lines
      .filter((l) =>
        ["MATERIAL", "PART", "OTHER"].includes(l?.lineType ?? ""),
      )
      .reduce(
        (s, l) =>
          s + (Number(l?.quantity) || 0) * (Number(l?.unitPrice) || 0),
        0,
      );
    return computeInvoiceTotals({
      laborSubtotal,
      materialSubtotal,
      partsSubtotal: 0,
      discountAmount,
      taxRate: invoiceTaxRate(billingType),
    });
  }, [watched.lines, discountAmount, billingType]);

  function save(
    values: UpdateInvoiceInput,
    syncFromWorkOrder = false,
  ) {
    setError(null);
    startTransition(async () => {
      const res = await updateInvoiceAction({
        ...values,
        syncFromWorkOrder,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/invoices/${res.id}`);
      router.refresh();
    });
  }

  function onSubmit(values: unknown) {
    save(values as UpdateInvoiceInput, false);
  }

  function syncFromWorkOrder() {
    save(form.getValues(), true);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-4xl">
      <div className="card p-5 space-y-4">
        <p className="text-sm text-rapid-text-muted">
          Orden ORD-{String(orderNumber).padStart(5, "0")} · Los cambios no
          modifican la orden de recepción, solo esta factura.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Cliente</label>
            <input className="form-input w-full" {...form.register("customerName")} />
          </div>
          <div>
            <label className="form-label">Cédula</label>
            <input className="form-input w-full" {...form.register("nationalId")} />
          </div>
          <div>
            <label className="form-label">Teléfono</label>
            <input className="form-input w-full" {...form.register("phone")} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input w-full" {...form.register("email")} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Dirección</label>
            <input className="form-input w-full" {...form.register("address")} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Marca</label>
            <input className="form-input w-full" {...form.register("brand")} />
          </div>
          <div>
            <label className="form-label">Modelo</label>
            <input className="form-input w-full" {...form.register("model")} />
          </div>
          <div>
            <label className="form-label">Año</label>
            <input
              type="number"
              className="form-input w-full"
              {...form.register("vehicleYear", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="form-label">Placa</label>
            <input className="form-input w-full" {...form.register("plate")} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">VIN</label>
            <input className="form-input w-full" {...form.register("vin")} />
          </div>
          <div>
            <label className="form-label">Fecha factura</label>
            <input
              type="date"
              className="form-input w-full"
              {...form.register("invoiceDate")}
            />
          </div>
          <div>
            <label className="form-label">Tipo facturación</label>
            <select className="form-input w-full" {...form.register("billingType")}>
              <option value="PRIVATE">Particular (sin ITBIS)</option>
              <option value="INSURANCE">Aseguradora (ITBIS 18%)</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Descuento (RD$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="form-input w-full"
              {...form.register("discountAmount", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="form-label">Notas</label>
            <textarea
              className="form-input w-full min-h-[72px]"
              {...form.register("notes")}
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-rapid-border flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold">Líneas de factura</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary text-sm"
              disabled={pending}
              onClick={syncFromWorkOrder}
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar desde orden
            </button>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => append({ ...defaultLine })}
            >
              <Plus className="w-4 h-4" />
              Línea
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rapid-surface/50 text-xs uppercase text-rapid-text-muted">
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Descripción</th>
                <th className="px-3 py-2 text-right w-24">Cant.</th>
                <th className="px-3 py-2 text-right w-28">Precio</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-t border-rapid-border/60">
                  <td className="px-3 py-2">
                    <select
                      className="form-input py-1.5 text-xs"
                      {...form.register(`lines.${index}.lineType`)}
                    >
                      {Object.entries(INVOICE_LINE_TYPES).map(([k, v]) => (
                        <option key={k} value={v}>
                          {INVOICE_LINE_TYPE_LABELS[v] ?? v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="form-input py-1.5 w-full min-w-[160px]"
                      {...form.register(`lines.${index}.description`)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0.01}
                      step="0.01"
                      className="form-input py-1.5 text-right w-full"
                      {...form.register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-input py-1.5 text-right w-full"
                      {...form.register(`lines.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        onClick={() => remove(index)}
                        aria-label="Eliminar línea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5 max-w-sm ml-auto space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono">{formatMoney(previewTotals.subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-rapid-text-muted">
            <span>Descuento</span>
            <span className="font-mono">−{formatMoney(discountAmount)}</span>
          </div>
        )}
        {invoiceTaxRate(billingType) > 0 && (
          <div className="flex justify-between">
            <span>ITBIS</span>
            <span className="font-mono">{formatMoney(previewTotals.taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-2 border-t">
          <span>Total</span>
          <span className="font-mono">{formatMoney(previewTotals.grandTotal)}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          <Save className="w-4 h-4" />
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
