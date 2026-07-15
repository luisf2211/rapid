"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Save, AlertCircle } from "lucide-react";
import {
  workOrderSchema,
  workOrderCreateSchema,
  type WorkOrderInput,
  type WorkOrderFormValues,
} from "@/lib/validations/work-order";
import { TextInput } from "@/components/forms/TextInput";
import { SelectInput } from "@/components/forms/SelectInput";
import { TextAreaInput } from "@/components/forms/TextAreaInput";
import { ChecklistGrid } from "@/components/forms/ChecklistGrid";
import { PhotoUploadList } from "@/components/forms/PhotoUploadList";
import { SignaturePad } from "@/components/forms/SignaturePad";
import { FUEL_LEVELS, DAMAGE_SIDES, DAMAGE_TYPES } from "@/lib/constants";
import {
  createWorkOrderAction,
  updateWorkOrderAction,
} from "@/app/(app)/work-orders/actions";

interface Props {
  mode: "create" | "edit";
  workOrderId?: number;
  orderNumber?: number;
  defaultValues: WorkOrderFormValues;
  cancelHref: string;
}

export function WorkOrderForm({
  mode,
  workOrderId,
  orderNumber,
  defaultValues,
  cancelHref,
}: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<WorkOrderFormValues, unknown, WorkOrderInput>({
    resolver: zodResolver(mode === "create" ? workOrderCreateSchema : workOrderSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const damagesArray = useFieldArray({ control, name: "damages" });
  const photosArray = useFieldArray({ control, name: "photos" });

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result =
        mode === "edit" && workOrderId != null
          ? await updateWorkOrderAction(workOrderId, data)
          : await createWorkOrderAction(data);
      if (result.ok) {
        router.push(`/work-orders/${result.id}`);
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
        : "Guardar orden";

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-12">
      <div className="card sticky top-0 z-10 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 backdrop-blur bg-white/95">
        {mode === "edit" && orderNumber != null ? (
          <p className="text-sm font-mono font-semibold text-rapid-text-muted">
            ORD-{String(orderNumber).padStart(5, "0")}
          </p>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Link href={cancelHref} className="btn-secondary">
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

      {/* Cliente */}
      <section id="cliente" className="card p-5">
        <SectionHeader
          title="Información del cliente"
          subtitle="Datos de contacto del propietario del vehículo"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Nombre del cliente *"
            placeholder="Juan Pérez"
            {...register("customerName")}
            error={errors.customerName?.message}
          />
          <TextInput
            label="Teléfono"
            placeholder="+1 809 555 0100"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="cliente@correo.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <TextInput
            label="Dirección"
            placeholder="Calle Principal #123"
            {...register("address")}
            error={errors.address?.message}
          />
        </div>
      </section>

      {/* Vehículo */}
      <section id="vehiculo" className="card p-5">
        <SectionHeader
          title="Datos del vehículo"
          subtitle="Información técnica del vehículo recibido"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextInput
            label="Marca *"
            placeholder="Toyota"
            {...register("brand")}
            error={errors.brand?.message}
          />
          <TextInput
            label="Modelo *"
            placeholder="Corolla"
            {...register("model")}
            error={errors.model?.message}
          />
          <TextInput
            label="Año *"
            type="number"
            {...register("vehicleYear")}
            error={errors.vehicleYear?.message}
          />
          <TextInput
            label="Color *"
            placeholder="Blanco perla"
            {...register("color")}
            error={errors.color?.message}
          />
          <TextInput
            label="Placa *"
            placeholder="A123456"
            {...register("plate")}
            className="uppercase"
            error={errors.plate?.message}
          />
          <TextInput
            label="Millaje"
            placeholder="120,000 mi"
            {...register("mileage")}
            error={errors.mileage?.message}
          />
          <TextInput
            label="Motor"
            placeholder="1.8L 4 cil"
            {...register("engine")}
            error={errors.engine?.message}
          />
        </div>
      </section>

      {/* Recepción */}
      <section id="recepcion" className="card p-5">
        <SectionHeader
          title="Recepción del vehículo"
          subtitle="Fecha y condición de entrada"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextInput
            label="Fecha de entrada *"
            type="date"
            {...register("deliveryDate")}
            error={errors.deliveryDate?.message}
          />
          <TextInput
            label="Hora de entrada *"
            type="time"
            {...register("deliveryTime")}
            error={errors.deliveryTime?.message}
          />
          <SelectInput
            label="Nivel de combustible"
            options={FUEL_LEVELS}
            {...register("fuelLevel")}
            error={errors.fuelLevel?.message}
          />
          <TextInput
            label="Fecha estimada de entrega"
            type="date"
            {...register("exitDate")}
            error={errors.exitDate?.message}
          />
          <TextInput
            label="Hora estimada de entrega"
            type="time"
            {...register("exitTime")}
            error={errors.exitTime?.message}
          />
          <TextInput
            label="Recibido por *"
            placeholder="Nombre del empleado"
            {...register("receivedBy")}
            error={errors.receivedBy?.message}
            containerClassName="lg:col-span-3"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextAreaInput
            label="Daños solicitados"
            placeholder="Daños que el cliente solicita reparar..."
            rows={4}
            {...register("requestedDamages")}
            error={errors.requestedDamages?.message}
          />
          <TextAreaInput
            label="Observaciones"
            placeholder="Notas adicionales del estado del vehículo..."
            rows={4}
            {...register("observations")}
            error={errors.observations?.message}
          />
        </div>
      </section>

      <section className="card p-5">
        <SectionHeader
          title="Firma del cliente"
          subtitle="El cliente firma digitalmente conforme con la recepción del vehículo"
        />
        <Controller
          control={control}
          name="customerReceivedSignature"
          render={({ field }) => (
            <SignaturePad
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.customerReceivedSignature?.message}
            />
          )}
        />
      </section>

      {/* Checklist */}
      <section id="checklist" className="card p-5">
        <SectionHeader
          title="Checklist de recepción"
          subtitle="Marca los elementos verificados y agrega comentarios si aplica"
        />
        <ChecklistGrid control={control} />
      </section>

      {/* Daños */}
      <section id="daños" className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-lg">Daños visuales</h2>
            <p className="text-sm text-rapid-text-muted">
              Registra cada daño detectado en el vehículo
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() =>
              damagesArray.append({
                vehicleSide: "FRONT",
                damageType: "SCRATCH",
                description: "",
                positionX: undefined,
                positionY: undefined,
              })
            }
          >
            <Plus className="w-4 h-4" /> Agregar daño
          </button>
        </div>

        {damagesArray.fields.length === 0 ? (
          <EmptyMini text="Sin daños registrados. Agrega uno con el botón de arriba." />
        ) : (
          <div className="space-y-3">
            {damagesArray.fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-lg bg-rapid-bg/50 border border-rapid-border"
              >
                <Controller
                  control={control}
                  name={`damages.${idx}.vehicleSide`}
                  render={({ field: f }) => (
                    <SelectInput
                      label="Lado"
                      options={DAMAGE_SIDES}
                      containerClassName="sm:col-span-2"
                      {...f}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`damages.${idx}.damageType`}
                  render={({ field: f }) => (
                    <SelectInput
                      label="Tipo"
                      options={DAMAGE_TYPES}
                      containerClassName="sm:col-span-2"
                      {...f}
                    />
                  )}
                />
                <TextInput
                  label="Descripción"
                  placeholder="Detalle del daño..."
                  containerClassName="sm:col-span-4"
                  {...register(`damages.${idx}.description`)}
                />
                <TextInput
                  label="Pos. X"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  containerClassName="sm:col-span-1"
                  {...register(`damages.${idx}.positionX`)}
                />
                <TextInput
                  label="Pos. Y"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  containerClassName="sm:col-span-1"
                  {...register(`damages.${idx}.positionY`)}
                />
                <div className="sm:col-span-2 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => damagesArray.remove(idx)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fotos */}
      <section id="fotos" className="card p-5">
        <SectionHeader
          title="Fotografías"
          subtitle="Carga imágenes desde tu dispositivo. Se guardan en el servidor local del taller."
        />
        <PhotoUploadList
          control={control}
          fields={photosArray.fields}
          append={photosArray.append}
          remove={photosArray.remove}
          errors={errors}
        />
      </section>

      <section className="card p-5">
        <SectionHeader title="Notas internas" />
        <TextAreaInput
          placeholder="Comentarios internos del taller..."
          rows={3}
          {...register("notes")}
          error={errors.notes?.message}
        />
      </section>

      <div className="flex justify-end gap-2 pt-2">
        <Link href={cancelHref} className="btn-secondary">
          Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="btn-primary">
          <Save className="w-4 h-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 pb-3 border-b border-rapid-border">
      <h2 className="font-bold text-lg">{title}</h2>
      {subtitle && (
        <p className="text-sm text-rapid-text-muted">{subtitle}</p>
      )}
    </div>
  );
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-rapid-border rounded-lg py-6 text-center text-sm text-rapid-text-muted">
      {text}
    </div>
  );
}
