"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";
import {
  publicQuoteRequestSchema,
  type PublicQuoteRequestValues,
} from "@/lib/validations/public-quote";
import { compressImage } from "@/lib/images/compress-client";
import { track } from "@/lib/analytics/track";
import { readAttributionCookie } from "@/lib/analytics/attribution";

const STEPS = ["Tu vehículo", "Fotos", "Contacto"] as const;

interface Props {
  slug: string;
  workshopName: string;
}

export function QuoteRequestForm({ slug, workshopName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<PublicQuoteRequestValues>({
    resolver: zodResolver(publicQuoteRequestSchema),
    defaultValues: {
      companySlug: slug,
      customerName: "",
      phone: "",
      email: "",
      brand: "",
      model: "",
      color: "",
      plate: "",
      message: "",
      photos: [],
    },
  });

  async function goNext() {
    let valid = true;
    if (step === 0) {
      valid = await trigger(["brand", "model", "vehicleYear", "message"]);
      if (valid) track("quote_started", { workshop: slug });
    }
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFiles(files: FileList) {
    setSubmitError(null);
    setUploading(true);
    try {
      for (const original of Array.from(files).slice(0, 12 - photos.length)) {
        // Comprime en el navegador para que fotos pesadas de celular
        // siempre pasen el límite y suban rápido.
        const file = await compressImage(original);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subfolder", "quotations");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (res.ok && json.photoUrl) {
          setPhotos((prev) => [...prev, json.photoUrl]);
        } else if (!res.ok) {
          setSubmitError(json.error || "Una foto no se pudo subir.");
        }
      }
      track("photos_uploaded", { workshop: slug });
    } catch {
      setSubmitError("No se pudieron subir algunas fotos. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  async function onSubmit(values: PublicQuoteRequestValues) {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        photos: photos.map((photoUrl) => ({ photoUrl })),
        attribution: readAttributionCookie() ?? undefined,
      };
      const res = await fetch("/api/public/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error || "No se pudo enviar la solicitud");
        return;
      }
      track("quote_submitted", { workshop: slug });
      router.push(`/rastrear/${json.publicToken}`);
    } catch {
      setSubmitError("Error de red. Revisa tu conexión e intenta de nuevo.");
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
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
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
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 bg-rapid-border" />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        {/* Paso 1: Vehículo + trabajo */}
        <div className={step === 0 ? "block" : "hidden"}>
          <h2 className="text-lg font-bold text-rapid-text">
            Cuéntanos sobre tu vehículo
          </h2>
          <p className="mt-1 text-sm text-rapid-text-muted">
            Con esto el taller entiende qué necesitas cotizar.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <TextInput label="Marca" placeholder="Toyota" {...register("brand")} />
            <TextInput label="Modelo" placeholder="Corolla" {...register("model")} />
            <TextInput
              label="Año"
              type="number"
              inputMode="numeric"
              placeholder="2020"
              error={errors.vehicleYear?.message}
              {...register("vehicleYear")}
            />
            <TextInput label="Color" placeholder="Gris" {...register("color")} />
            <TextInput
              label="Placa (opcional)"
              placeholder="A123456"
              containerClassName="sm:col-span-2"
              {...register("plate")}
            />
          </div>

          <div className="mt-4">
            <label className="form-label" htmlFor="message">
              ¿Qué necesitas?
            </label>
            <textarea
              id="message"
              rows={4}
              className={`form-input ${errors.message ? "border-rapid-error" : ""}`}
              placeholder="Ej: Tengo un rayón profundo en la puerta delantera derecha y quiero pintarla."
              {...register("message")}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-rapid-error">
                {errors.message.message}
              </p>
            )}
          </div>
        </div>

        {/* Paso 2: Fotos */}
        <div className={step === 1 ? "block" : "hidden"}>
          <h2 className="text-lg font-bold text-rapid-text">
            Agrega fotos del daño
          </h2>
          <p className="mt-1 text-sm text-rapid-text-muted">
            Las fotos ayudan al taller a darte una propuesta más precisa. Es
            opcional, pero muy recomendado.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-xl border border-rapid-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Foto del vehículo" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-red-500"
                  aria-label="Quitar foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {photos.length < 12 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-rapid-border text-rapid-text-muted transition-colors hover:border-rapid-green hover:text-rapid-green disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">
                  {uploading ? "Subiendo" : "Agregar"}
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Paso 3: Contacto */}
        <div className={step === 2 ? "block" : "hidden"}>
          <h2 className="text-lg font-bold text-rapid-text">
            ¿Cómo te contactamos?
          </h2>
          <p className="mt-1 text-sm text-rapid-text-muted">
            {workshopName} te enviará su propuesta y podrá llamarte si necesita
            más detalles.
          </p>

          <div className="mt-6 space-y-4">
            <TextInput
              label="Nombre"
              placeholder="Tu nombre"
              error={errors.customerName?.message}
              {...register("customerName")}
            />
            <TextInput
              label="Teléfono / WhatsApp"
              type="tel"
              inputMode="tel"
              placeholder="809-000-0000"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <TextInput
              label="Correo"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              hint="Te avisamos por aquí cuando tu cotización esté lista."
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
        </div>

        {submitError && (
          <div className="mt-6 rounded-lg border border-rapid-error/30 bg-rapid-error-soft px-4 py-3 text-sm text-rapid-error">
            {submitError}
          </div>
        )}

        {/* Navegación */}
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
                  Enviando
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar solicitud
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
