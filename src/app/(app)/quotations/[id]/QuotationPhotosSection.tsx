"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { PhotoPreview } from "@/components/ui/PhotoPreview";
import { QUOTATION_PHOTO_CATEGORY_LABELS } from "@/lib/constants";
import {
  addQuotationPhotosAction,
  deleteQuotationPhotoAction,
} from "../actions";

export type QuotationPhotoItem = {
  id: number;
  photoUrl: string;
  category: string | null;
  description: string | null;
};

export function QuotationPhotosSection({
  quotationId,
  photos: initialPhotos,
  editable,
}: {
  quotationId: number;
  photos: QuotationPhotoItem[];
  editable: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length || !editable) return;
    setError(null);
    setUploading(true);

    try {
      const uploaded: { photoUrl: string; category: "INSPECTION"; description: string }[] =
        [];

      for (const file of Array.from(fileList)) {
        const body = new FormData();
        body.append("file", file);
        body.append("subfolder", "quotations");

        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { photoUrl?: string; error?: string };
        if (!res.ok || !data.photoUrl) {
          throw new Error(data.error ?? "Error al subir");
        }
        uploaded.push({
          photoUrl: data.photoUrl,
          category: "INSPECTION",
          description: "",
        });
      }

      startTransition(async () => {
        const result = await addQuotationPhotosAction(quotationId, uploaded);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDelete(photoId: number) {
    if (!editable || !confirm("¿Eliminar esta foto?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteQuotationPhotoAction(quotationId, photoId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const busy = uploading || pending;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
          Fotos {initialPhotos.length > 0 && `(${initialPhotos.length})`}
        </h2>
        {editable && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Subir
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {initialPhotos.length === 0 ? (
        <div className="border border-dashed border-rapid-border rounded-xl py-10 flex flex-col items-center text-rapid-text-muted gap-2">
          <ImagePlus className="w-8 h-8 opacity-40" />
          <p className="text-sm">Sin fotos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {initialPhotos.map((p) => (
            <div
              key={p.id}
              className="relative group rounded-lg overflow-hidden border border-rapid-border bg-rapid-bg aspect-[4/3]"
            >
              <PhotoPreview
                src={p.photoUrl}
                alt={p.description ?? "Foto cotización"}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                <p className="text-[10px] text-white font-medium truncate">
                  {p.category
                    ? QUOTATION_PHOTO_CATEGORY_LABELS[p.category] ?? p.category
                    : "Foto"}
                </p>
                {p.description && (
                  <p className="text-[10px] text-white/80 truncate">{p.description}</p>
                )}
              </div>
              {editable && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDelete(p.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition shadow"
                  aria-label="Eliminar foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
