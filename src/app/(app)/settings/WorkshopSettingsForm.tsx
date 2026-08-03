"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workshopSettingsSchema,
  type WorkshopSettingsInput,
  type WorkshopSettingsFormValues,
} from "@/lib/validations/workshop-settings";
import { TextInput } from "@/components/forms/TextInput";
import { TextAreaInput } from "@/components/forms/TextAreaInput";
import { ImageUploadInput } from "@/components/forms/ImageUploadInput";
import { updateWorkshopSettingsAction } from "./actions";

export type SettingsFormDefaults = {
  businessName: string;
  legalName: string;
  rnc: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  stampUrl: string;
  defaultTaxRate: number;
  quotationFooter: string;
  quotationWarrantyNotes: string;
  quotationPaymentNotes: string;
  invoiceFooter: string;
  brandColor: string;
};

interface Props {
  defaults: SettingsFormDefaults;
  fromDatabase: boolean;
}

export function WorkshopSettingsForm({ defaults, fromDatabase }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WorkshopSettingsFormValues>({
    resolver: zodResolver(workshopSettingsSchema),
    defaultValues: {
      ...defaults,
      updatedBy: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateWorkshopSettingsAction(data);
      if (result.ok) setSaved(true);
      else setSubmitError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!fromDatabase && (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Aún no hay fila en <code className="text-xs">WorkshopSettings</code>.
          Al guardar se creará. Si falla, ejecuta el script SQL{" "}
          <code className="text-xs">004-workshop-invoice-audit-settings.sql</code>{" "}
          y <code className="text-xs">npx prisma generate</code>.
        </div>
      )}

      {submitError && (
        <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {submitError}
        </div>
      )}
      {saved && (
        <div className="card border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Configuración guardada. Los documentos impresos usarán estos datos.
        </div>
      )}

      <section className="card p-5 space-y-4">
        <h2 className="font-bold text-lg">Datos del taller</h2>
        <p className="text-sm text-rapid-text-muted">
          Aparecen en encabezados de cotizaciones, recepciones y facturas.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextInput
            label="Nombre comercial"
            {...register("businessName")}
            error={errors.businessName?.message}
          />
          <TextInput
            label="Razón social"
            {...register("legalName")}
            error={errors.legalName?.message}
          />
          <TextInput label="RNC" {...register("rnc")} error={errors.rnc?.message} />
          <TextInput
            label="Teléfono"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <TextInput
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="logoUrl"
            render={({ field }) => (
              <ImageUploadInput
                label="Logo del taller"
                value={field.value ?? ""}
                onChange={field.onChange}
                subfolder="workshop"
                error={errors.logoUrl?.message}
                hint="PNG o JPG. Aparece en encabezados de documentos."
              />
            )}
          />
          <Controller
            control={control}
            name="stampUrl"
            render={({ field }) => (
              <ImageUploadInput
                label="Sello digital"
                value={field.value ?? ""}
                onChange={field.onChange}
                subfolder="workshop"
                error={errors.stampUrl?.message}
                hint="Aparece como marca de agua en las firmas del taller."
              />
            )}
          />
        </div>
        <TextAreaInput
          label="Dirección"
          rows={2}
          {...register("address")}
          error={errors.address?.message}
        />
        <div>
          <label className="form-label" htmlFor="brandColor">Color de marca</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="brandColor"
              {...register("brandColor")}
              className="w-12 h-12 rounded-lg border border-rapid-border cursor-pointer p-1"
            />
            <input
              type="text"
              {...register("brandColor")}
              placeholder="#c41e3a"
              className="form-input w-32 font-mono text-sm"
              maxLength={7}
            />
            <span className="text-xs text-rapid-text-muted">
              Se usa en encabezados y títulos de documentos impresos.
            </span>
          </div>
          {errors.brandColor?.message && (
            <p className="mt-1 text-xs text-rapid-error">{errors.brandColor.message}</p>
          )}
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-bold text-lg">Facturación e impresión</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextInput
            label="ITBIS por defecto (decimal, ej. 0.18)"
            type="number"
            step="0.01"
            min={0}
            max={1}
            {...register("defaultTaxRate", { valueAsNumber: true })}
            error={errors.defaultTaxRate?.message}
          />
        </div>
        <TextAreaInput
          label="Mensaje de garantía (cotizaciones)"
          rows={3}
          placeholder="6 meses en pintura y 3 meses en carrocería..."
          {...register("quotationWarrantyNotes")}
          error={errors.quotationWarrantyNotes?.message}
        />
        <TextAreaInput
          label="Forma de pago (cotizaciones)"
          rows={2}
          placeholder="50% anticipo al aprobar; saldo contra entrega."
          {...register("quotationPaymentNotes")}
          error={errors.quotationPaymentNotes?.message}
        />
        <TextAreaInput
          label="Pie de cotización"
          rows={3}
          placeholder="Términos, validez, notas legales..."
          {...register("quotationFooter")}
          error={errors.quotationFooter?.message}
        />
        <TextAreaInput
          label="Pie de factura"
          rows={3}
          placeholder="Formas de pago, notas legales..."
          {...register("invoiceFooter")}
          error={errors.invoiceFooter?.message}
        />
      </section>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <TextInput
          label="Actualizado por (opcional)"
          className="sm:max-w-xs"
          {...register("updatedBy")}
          error={errors.updatedBy?.message}
        />
        <button type="submit" className="btn-primary sm:px-8" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}
