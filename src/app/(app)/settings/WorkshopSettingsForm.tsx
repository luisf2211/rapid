"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workshopSettingsSchema,
  type WorkshopSettingsInput,
  type WorkshopSettingsFormValues,
} from "@/lib/validations/workshop-settings";
import { TextInput } from "@/components/forms/TextInput";
import { TextAreaInput } from "@/components/forms/TextAreaInput";
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
          <TextInput
            label="URL del logo"
            placeholder="/uploads/logo.png"
            {...register("logoUrl")}
            error={errors.logoUrl?.message}
          />
          <TextInput
            label="URL del sello digital"
            placeholder="/uploads/sello.png"
            {...register("stampUrl")}
            error={errors.stampUrl?.message}
          />
        </div>
        <TextAreaInput
          label="Dirección"
          rows={2}
          {...register("address")}
          error={errors.address?.message}
        />
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
