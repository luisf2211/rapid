"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";
import {
  workshopSignupSchema,
  type WorkshopSignupValues,
} from "@/lib/validations/workshop-signup";
import { registerWorkshopAction } from "../actions";
import { track } from "@/lib/analytics/track";

const STEPS = ["Tu cuenta", "El taller", "Servicios", "Perfil"] as const;

interface Props {
  serviceOptions: string[];
}

export function WorkshopSignupForm({ serviceOptions }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<WorkshopSignupValues>({
    resolver: zodResolver(workshopSignupSchema),
    defaultValues: {
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
      ownerPhone: "",
      password: "",
      workshopName: "",
      rnc: "",
      workshopPhone: "",
      whatsapp: "",
      address: "",
      city: "",
      services: [],
      description: "",
    },
  });

  async function goNext() {
    let ok = true;
    if (step === 0) {
      ok = await trigger([
        "ownerFirstName",
        "ownerLastName",
        "ownerEmail",
        "ownerPhone",
        "password",
      ]);
      if (ok && step === 0) track("workshop_registration_started");
    } else if (step === 1) {
      ok = await trigger(["workshopName", "city"]);
    } else if (step === 2) {
      ok = await trigger(["services"]);
    }
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function toggleService(name: string) {
    setServices((prev) => {
      const next = prev.includes(name)
        ? prev.filter((s) => s !== name)
        : [...prev, name];
      setValue("services", next, { shouldValidate: true });
      return next;
    });
  }

  async function onSubmit(values: WorkshopSignupValues) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await registerWorkshopAction(values);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      track("workshop_registration_completed");
      router.push(res.redirectTo);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                i < step
                  ? "bg-rapid-green text-white"
                  : i === step
                    ? "bg-rapid-black text-white"
                    : "bg-rapid-surface-strong text-rapid-text-muted-soft"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden text-sm font-medium sm:block ${
                i === step ? "text-rapid-text" : "text-rapid-text-muted-soft"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-rapid-border" />}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        {/* Paso 1: cuenta */}
        <div className={step === 0 ? "block" : "hidden"}>
          <h2 className="text-lg font-bold text-rapid-text">Tu cuenta</h2>
          <p className="mt-1 text-sm text-rapid-text-muted">
            Serás el administrador del taller.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <TextInput label="Nombre" error={errors.ownerFirstName?.message} {...register("ownerFirstName")} />
            <TextInput label="Apellido" error={errors.ownerLastName?.message} {...register("ownerLastName")} />
            <TextInput label="Correo" type="email" error={errors.ownerEmail?.message} {...register("ownerEmail")} />
            <TextInput label="Teléfono" type="tel" error={errors.ownerPhone?.message} {...register("ownerPhone")} />
            <TextInput
              label="Contraseña"
              type="password"
              hint="Mínimo 6 caracteres"
              containerClassName="sm:col-span-2"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>
        </div>

        {/* Paso 2: taller */}
        <div className={step === 1 ? "block" : "hidden"}>
          <h2 className="text-lg font-bold text-rapid-text">Datos del taller</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <TextInput label="Nombre del taller" containerClassName="sm:col-span-2" error={errors.workshopName?.message} {...register("workshopName")} />
            <TextInput label="Ciudad" error={errors.city?.message} {...register("city")} />
            <TextInput label="RNC (opcional)" {...register("rnc")} />
            <TextInput label="Teléfono del taller (opcional)" type="tel" {...register("workshopPhone")} />
            <TextInput label="WhatsApp (opcional)" type="tel" {...register("whatsapp")} />
            <TextInput label="Dirección (opcional)" containerClassName="sm:col-span-2" {...register("address")} />
          </div>
        </div>

        {/* Paso 3: servicios */}
        <div className={step === 2 ? "block" : "hidden"}>
          <h2 className="text-lg font-bold text-rapid-text">¿Qué servicios ofreces?</h2>
          <p className="mt-1 text-sm text-rapid-text-muted">Elige al menos uno.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {serviceOptions.map((s) => {
              const active = services.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`rounded-full border px-4 py-2 text-[15px] transition-colors ${
                    active
                      ? "border-rapid-green bg-rapid-green-soft text-rapid-green-dark"
                      : "border-rapid-border text-rapid-text-body hover:border-rapid-text/30"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {errors.services && (
            <p className="mt-3 text-xs text-rapid-error">{errors.services.message}</p>
          )}
        </div>

        {/* Paso 4: perfil */}
        <div className={step === 3 ? "block" : "hidden"}>
          <h2 className="text-lg font-bold text-rapid-text">Perfil público</h2>
          <p className="mt-1 text-sm text-rapid-text-muted">
            Cuéntales a los clientes sobre tu taller. Podrás editarlo luego.
          </p>
          <div className="mt-6">
            <label className="form-label" htmlFor="description">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              rows={4}
              className="form-input"
              placeholder="Ej: Taller de pintura automotriz con más de 10 años de experiencia..."
              {...register("description")}
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rapid-error/30 bg-rapid-error-soft px-4 py-3 text-sm text-rapid-error">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={goBack} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} className="btn-primary">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando
                </>
              ) : (
                "Crear mi taller"
              )}
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-rapid-text-muted">
        Al crear tu taller aceptas que revisemos tu perfil antes de publicarlo.
      </p>
    </form>
  );
}
