"use client";

import { useRef, useState } from "react";
import {
  Controller,
  type Control,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type FieldErrors,
} from "react-hook-form";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { SelectInput } from "@/components/forms/SelectInput";
import { TextInput } from "@/components/forms/TextInput";
import { PHOTO_TYPES } from "@/lib/constants";
import type { WorkOrderFormValues } from "@/lib/validations/work-order";

/** Mismos límites que valida el servidor en saveUploadedImage. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const UPLOAD_CONCURRENCY = 4;

interface PhotoUploadListProps {
  control: Control<WorkOrderFormValues>;
  fields: FieldArrayWithId<WorkOrderFormValues, "photos", "id">[];
  append: UseFieldArrayAppend<WorkOrderFormValues, "photos">;
  remove: UseFieldArrayRemove;
  errors?: FieldErrors<WorkOrderFormValues>;
}

export function PhotoUploadList({
  control,
  fields,
  append,
  remove,
  errors,
}: PhotoUploadListProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [fileErrors, setFileErrors] = useState<
    { name: string; message: string }[]
  >([]);

  async function uploadOne(file: File): Promise<string> {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("Supera los 10 MB");
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_UPLOAD_EXT.has(ext)) {
      throw new Error("Formato no permitido. Usa JPG, PNG, WEBP o GIF.");
    }

    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = (await res.json()) as { photoUrl?: string; error?: string };

    if (!res.ok || !data.photoUrl) {
      throw new Error(data.error ?? "No se pudo subir la imagen");
    }
    return data.photoUrl;
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;

    const files = Array.from(fileList);
    setFileErrors([]);
    setProgress({ done: 0, total: files.length });

    // En paralelo, pero acotado para no saturar la conexión en el taller.
    const results: PromiseSettledResult<string>[] = [];
    for (let i = 0; i < files.length; i += UPLOAD_CONCURRENCY) {
      const chunk = files.slice(i, i + UPLOAD_CONCURRENCY);
      const settled = await Promise.allSettled(
        chunk.map((file) =>
          uploadOne(file).finally(() =>
            setProgress((p) => (p ? { ...p, done: p.done + 1 } : p)),
          ),
        ),
      );
      results.push(...settled);
    }

    // Se agregan al final para respetar el orden en que se seleccionaron.
    const failed: { name: string; message: string }[] = [];
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        append({
          photoUrl: result.value,
          photoType: "RECEPTION",
          description: "",
        });
      } else {
        failed.push({
          name: files[idx].name,
          message:
            result.reason instanceof Error
              ? result.reason.message
              : "Error al subir la imagen",
        });
      }
    });

    setFileErrors(failed);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const uploading = progress !== null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-primary text-sm"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {progress
            ? `Subiendo ${progress.done} de ${progress.total}...`
            : "Cargar imágenes"}
        </button>
        <p className="text-xs text-rapid-text-muted">
          Puedes seleccionar varias · JPG, PNG, WEBP o GIF · máx. 10 MB por archivo
        </p>
      </div>

      {fileErrors.length > 0 && (
        <ul className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 space-y-1">
          {fileErrors.map((f) => (
            <li key={f.name}>
              <span className="font-semibold">{f.name}</span>: {f.message}
            </li>
          ))}
        </ul>
      )}

      {errors?.photos?.message && (
        <p className="text-xs text-red-600">{errors.photos.message}</p>
      )}

      {fields.length === 0 ? (
        <div className="border border-dashed border-rapid-border rounded-xl py-12 flex flex-col items-center justify-center text-rapid-text-muted gap-2">
          <ImagePlus className="w-10 h-10 opacity-40" />
          <p className="text-sm">Sin fotos cargadas</p>
          <p className="text-xs">Usa el botón para seleccionar imágenes del vehículo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, idx) => (
            <PhotoRow
              key={field.id}
              control={control}
              index={idx}
              onRemove={() => remove(idx)}
              error={errors?.photos?.[idx]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoRow({
  control,
  index,
  onRemove,
  error,
}: {
  control: Control<WorkOrderFormValues>;
  index: number;
  onRemove: () => void;
  error?: { photoUrl?: { message?: string }; description?: { message?: string } };
}) {
  return (
    <div className="card overflow-hidden flex flex-col sm:flex-row">
      <Controller
        control={control}
        name={`photos.${index}.photoUrl`}
        render={({ field }) => (
          <div className="relative w-full sm:w-40 aspect-video sm:aspect-square bg-rapid-bg shrink-0">
            {field.value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={field.value}
                alt="Vista previa"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-rapid-text-muted">
                Sin imagen
              </div>
            )}
          </div>
        )}
      />

      <div className="flex-1 p-3 space-y-2.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-rapid-text-muted">
            Foto {index + 1}
          </p>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Quitar foto"
            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <Controller
          control={control}
          name={`photos.${index}.photoType`}
          render={({ field: f }) => (
            <SelectInput
              label="Tipo"
              options={PHOTO_TYPES}
              {...f}
            />
          )}
        />

        <Controller
          control={control}
          name={`photos.${index}.description`}
          render={({ field }) => (
            <TextInput
              label="Descripción"
              placeholder="Opcional"
              {...field}
              value={field.value ?? ""}
              error={error?.description?.message}
            />
          )}
        />

        {error?.photoUrl?.message && (
          <p className="text-xs text-red-600">{error.photoUrl.message}</p>
        )}
      </div>
    </div>
  );
}
