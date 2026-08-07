"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Save, Send, AlertCircle } from "lucide-react";
import {
  quotationSchema,
  type QuotationInput,
  type QuotationFormValues,
} from "@/lib/validations/quotation";
import {
  quotationLaborAreaOptions,
  QUOTATION_TYPES,
  DAMAGE_SIDES,
  DAMAGE_TYPES,
  SUGGESTED_PARTS,
} from "@/lib/constants";
import {
  computeQuotationTotals,
  lineTotalFromQtyPrice,
  quotationTaxRate,
} from "@/lib/quotation/totals";
import { TextInput } from "@/components/forms/TextInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { MileageInput } from "@/components/forms/MileageInput";
import { formatMoney } from "@/lib/formatters/money";
import { QuotationPhotoUploadList } from "@/components/forms/QuotationPhotoUploadList";
import { createQuotationAction, updateQuotationAction } from "../actions";

const emptyLabor = () => ({
  area: "REPAIR_PAINT" as const,
  description: "",
  lineTotal: 0,
});

const emptyPart = () => ({
  partName: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
});

function appendPreservingScroll(append: () => void) {
  const currentY = window.scrollY;
  append();
  requestAnimationFrame(() => {
    window.scrollTo({ top: currentY });
  });
}

export function NewQuotationForm({
  quotationId,
  initialValues,
  currentStatus,
  cancelHref = "/quotations",
  successHref,
}: {
  /** Si se define, el formulario actualiza en lugar de crear. */
  quotationId?: number;
  initialValues?: QuotationFormValues;
  currentStatus?: string;
  cancelHref?: string;
  successHref?: string;
}) {
  const isEdit = quotationId != null;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<QuotationFormValues, unknown, QuotationInput>({
    resolver: zodResolver(quotationSchema),
    defaultValues: initialValues ?? {
      quotationType: "PRIVATE",
      submitStatus: "DRAFT",
      customerName: "",
      laborLines: [emptyLabor()],
      materialLines: [],
      partLines: [],
      damages: [],
      photos: [],
      discountAmount: 0,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = form;

  const laborFields = useFieldArray({ control, name: "laborLines" });
  const partFields = useFieldArray({ control, name: "partLines" });
  const photoFields = useFieldArray({ control, name: "photos" });

  const quotationType = watch("quotationType");
  const watchedLabor = useWatch({ control, name: "laborLines" });
  const watchedParts = useWatch({ control, name: "partLines" });
  const discountAmount = Number(watch("discountAmount")) || 0;

  const previewTotals = useMemo(() => {
    const labor = (watchedLabor ?? []).map((l) => ({
      lineTotal: Number(l?.lineTotal) || 0,
    }));
    const parts = (watchedParts ?? []).map((p) => ({
      lineTotal: lineTotalFromQtyPrice(
        Number(p?.quantity) || 0,
        Number(p?.unitPrice) || 0,
      ),
    }));
    return computeQuotationTotals({
      laborLines: labor,
      materialLines: [],
      partLines: parts,
      discountAmount,
      taxRate: quotationTaxRate(quotationType ?? "PRIVATE"),
    });
  }, [watchedLabor, watchedParts, discountAmount, quotationType]);

  const save = (
    submitStatus: "DRAFT" | "PENDING",
    preserveStatus?: boolean,
  ) =>
    handleSubmit((data) => {
      setSubmitError(null);
      const payload = { ...data, submitStatus, materialLines: [] };
      startTransition(async () => {
        if (isEdit && quotationId) {
          const res = await updateQuotationAction(quotationId, payload, {
            preserveStatus,
          });
          if (!res.ok) {
            setSubmitError(res.error);
            return;
          }
          router.push(
            successHref ?? `/quotations/${quotationId}`,
          );
          return;
        }
        const res = await createQuotationAction(payload);
        if (!res.ok) {
          setSubmitError(res.error);
          return;
        }
        if ("id" in res) router.push(`/quotations/${res.id}`);
      });
    });

  const canSendForApproval =
    !currentStatus ||
    currentStatus === "DRAFT" ||
    currentStatus === "REJECTED";

  return (
    <form className="space-y-6">
      {submitError && (
        <div className="card border-red-200 bg-red-50 p-4 flex gap-2 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {submitError}
        </div>
      )}

      <section className="card p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
          Cliente
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">Tipo</label>
            <select {...register("quotationType")} className="form-input w-full">
              {QUOTATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <TextInput
            label="Válida hasta"
            type="date"
            error={errors.validUntil?.message}
            {...register("validUntil")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Cliente *"
            error={errors.customerName?.message}
            {...register("customerName")}
          />
          <TextInput label="Teléfono" {...register("phone")} />
          <TextInput label="Email" {...register("email")} />
          <TextInput label="Cédula / RNC" {...register("nationalId")} />
        </div>
        <TextInput label="Dirección" {...register("address")} />
      </section>

      {quotationType === "INSURANCE" && (
        <InsuranceSection register={register} errors={errors} setValue={form.setValue} />
      )}

      <section className="card p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
          Vehículo
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextInput label="Marca" {...register("brand")} />
          <TextInput label="Modelo" {...register("model")} />
          <TextInput label="Año" type="number" {...register("vehicleYear")} />
          <TextInput label="Color" {...register("color")} />
          <TextInput label="Placa" {...register("plate")} />
          <TextInput label="VIN" {...register("vin")} />
          <Controller
            control={control}
            name="mileageUnit"
            render={({ field }) => (
              <MileageInput
                label="Millaje"
                placeholder="120,000"
                unit={field.value ?? "mi"}
                onUnitChange={field.onChange}
                error={errors.mileage?.message}
                {...register("mileage")}
              />
            )}
          />
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
            Mano de obra
          </h2>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => appendPreservingScroll(() => laborFields.append(emptyLabor()))}
          >
            <Plus className="w-3.5 h-3.5" /> Línea
          </button>
        </div>
        {errors.laborLines?.message && (
          <p className="text-xs text-red-600">{String(errors.laborLines.message)}</p>
        )}
        {laborFields.fields.map((field, idx) => {
          const areaValue = watchedLabor?.[idx]?.area;
          return (
          <div
            key={field.id}
            className="grid gap-3 sm:grid-cols-[minmax(11rem,1fr)_1fr_7rem_auto] items-end border-b border-rapid-border pb-4 last:border-0"
          >
            <div>
              <label className="form-label">Tarea</label>
              <select
                {...register(`laborLines.${idx}.area`)}
                className="form-input w-full"
              >
                {quotationLaborAreaOptions(
                  typeof areaValue === "string" ? areaValue : undefined,
                ).map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <TextInput
              label="Detalle (opcional)"
              {...register(`laborLines.${idx}.description`)}
            />
            <MoneyInput label="Total" {...register(`laborLines.${idx}.lineTotal`)} />
            {quotationType === "INSURANCE" && (
              <select
                {...register(`laborLines.${idx}.billingTarget`)}
                className="form-input w-24 text-xs"
                title="Facturar a"
              >
                <option value="INSURANCE">Seguro</option>
                <option value="CLIENT">Extra</option>
              </select>
            )}
            <button
              type="button"
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              onClick={() => laborFields.remove(idx)}
              aria-label="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          );
        })}
      </section>

      <section className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
            Repuestos
          </h2>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => appendPreservingScroll(() => partFields.append(emptyPart()))}
          >
            <Plus className="w-3.5 h-3.5" /> Repuesto
          </button>
        </div>
        {partFields.fields.map((field, idx) => (
          <div
            key={field.id}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_5rem_5rem_auto] items-end border-b border-rapid-border pb-4"
          >
            <div>
              <label className="form-label">Pieza *</label>
              <input
                list={`parts-suggest-${idx}`}
                className="form-input w-full"
                {...register(`partLines.${idx}.partName`)}
              />
              <datalist id={`parts-suggest-${idx}`}>
                {SUGGESTED_PARTS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            <TextInput label="Detalle" {...register(`partLines.${idx}.description`)} />
            <TextInput
              label="Cant."
              type="number"
              {...register(`partLines.${idx}.quantity`)}
            />
            <MoneyInput label="Precio" {...register(`partLines.${idx}.unitPrice`)} />
            {quotationType === "INSURANCE" && (
              <select
                {...register(`partLines.${idx}.billingTarget`)}
                className="form-input w-24 text-xs"
                title="Facturar a"
              >
                <option value="INSURANCE">Seguro</option>
                <option value="CLIENT">Extra</option>
              </select>
            )}
            <button
              type="button"
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              onClick={() => partFields.remove(idx)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </section>

      {!isEdit && (
        <section className="card p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
            Fotos
          </h2>
          <QuotationPhotoUploadList
            control={control}
            fields={photoFields.fields}
            append={photoFields.append}
            remove={photoFields.remove}
            errors={errors}
          />
        </section>
      )}

      {isEdit && quotationId && (
        <p className="text-sm text-rapid-text-muted">
          <Link
            href={`/quotations/${quotationId}`}
            className="text-rapid-green font-medium hover:underline"
          >
            Ver cotización
          </Link>{" "}
          para subir fotos.
        </p>
      )}

      <section className="card p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
          Total y notas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyInput
            label="Descuento"
            error={errors.discountAmount?.message}
            {...register("discountAmount")}
          />
          <TextInput label="Días estimados" type="number" {...register("estimatedDays")} />
        </div>
        <div>
          <label className="form-label">Condiciones al cliente</label>
          <textarea {...register("termsNotes")} className="form-input w-full min-h-[80px]" />
        </div>
        <div>
          <label className="form-label">Notas internas</label>
          <textarea {...register("internalNotes")} className="form-input w-full min-h-[60px]" />
        </div>
        <div className="rounded-lg bg-rapid-surface border border-rapid-border p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Mano de obra</span>
            <span>{formatMoney(previewTotals.laborSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Repuestos</span>
            <span>{formatMoney(previewTotals.partsSubtotal)}</span>
          </div>
          {quotationType === "INSURANCE" && (
            <div className="flex justify-between text-rapid-text-muted">
              <span>ITBIS 18%</span>
              <span>{formatMoney(previewTotals.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-rapid-border">
            <span>Total</span>
            <span>{formatMoney(previewTotals.grandTotal)}</span>
          </div>
        </div>
      </section>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 py-4 bg-rapid-bg/95 border-t border-rapid-border sm:border-0 sm:pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-4xl">
          <Link
            href={cancelHref}
            className="text-sm text-rapid-text-muted hover:text-rapid-text"
          >
            Cancelar
          </Link>
          <div className="flex flex-wrap gap-2 justify-end">
            {isEdit ? (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isPending}
                  onClick={save("DRAFT", true)}
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                {canSendForApproval && (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={isPending}
                    onClick={save("PENDING", false)}
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isPending}
                  onClick={save("DRAFT")}
                >
                  Borrador
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={isPending}
                  onClick={save("PENDING")}
                >
                  <Send className="w-4 h-4" />
                  Guardar y enviar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

/** Sección de aseguradora con autocomplete desde el catálogo. */
function InsuranceSection({
  register,
  errors,
  setValue,
}: {
  register: ReturnType<typeof useForm<QuotationFormValues>>["register"];
  errors: ReturnType<typeof useForm<QuotationFormValues>>["formState"]["errors"];
  setValue: ReturnType<typeof useForm<QuotationFormValues>>["setValue"];
}) {
  const [suggestions, setSuggestions] = useState<
    { id: number; name: string; rnc: string | null; phone: string | null; contactName: string | null }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch("/api/insurance-companies");
      if (!res.ok) return;
      const data = await res.json();
      const filtered = data.filter((c: { name: string }) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch { /* ignore */ }
  };

  const selectCompany = (company: typeof suggestions[number]) => {
    setValue("insuranceCompany", company.name);
    setValue("insurerRnc", company.rnc ?? "");
    setValue("adjusterName", company.contactName ?? "");
    setValue("adjusterPhone", company.phone ?? "");
    setShowSuggestions(false);
  };

  return (
    <section className="card p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
        Aseguradora
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative">
          <TextInput
            label="Compania *"
            error={errors.insuranceCompany?.message}
            {...register("insuranceCompany", {
              onChange: (e) => fetchSuggestions(e.target.value),
            })}
            onFocus={(e) => fetchSuggestions(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-rapid-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-rapid-surface-soft"
                    onMouseDown={() => selectCompany(c)}
                  >
                    <span className="font-medium">{c.name}</span>
                    {c.rnc && <span className="text-xs text-rapid-text-muted ml-2">RNC: {c.rnc}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <TextInput label="RNC aseguradora" {...register("insurerRnc")} />
        <TextInput label="No. de poliza" {...register("policyNumber")} />
        <TextInput label="No. reclamo" {...register("claimNumber")} />
        <MoneyInput label="Deducible" error={errors.deductibleAmount?.message} {...register("deductibleAmount")} />
        <TextInput label="Ajustador" {...register("adjusterName")} />
        <TextInput label="Tel. ajustador" {...register("adjusterPhone")} />
      </div>
    </section>
  );
}
