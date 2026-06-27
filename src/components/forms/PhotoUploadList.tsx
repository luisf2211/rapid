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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploadError(null);
    setUploading(true);

    try {
      for (const file of Array.from(fileList)) {
        const body = new FormData();
        body.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body,
        });

        const data = (await res.json()) as {
          photoUrl?: string;
          error?: string;
        };

        if (!res.ok || !data.photoUrl) {
          throw new Error(data.error ?? "No se pudo subir la imagen");
        }

        append({
          photoUrl: data.photoUrl,
          photoType: "RECEPTION",
          description: "",
        });
      }
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Error al subir la imagen",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

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
          {uploading ? "Subiendo..." : "Cargar imágenes"}
        </button>
        <p className="text-xs text-rapid-text-muted">
          JPG, PNG, WEBP o GIF · máx. 10 MB por archivo
        </p>
      </div>

      {uploadError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {uploadError}
        </p>
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
