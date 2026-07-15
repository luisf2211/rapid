"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  subfolder: string;
  error?: string;
  /** Hint text below the input */
  hint?: string;
}

/**
 * Image upload input with preview.
 * Uploads to /api/upload with the specified subfolder,
 * stores the returned photoUrl in the form field.
 */
export function ImageUploadInput({
  label,
  value,
  onChange,
  subfolder,
  error,
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subfolder", subfolder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setUploadError(json.error || "Error al subir la imagen");
        return;
      }

      onChange(json.photoUrl);
    } catch {
      setUploadError("Error de red al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleRemove() {
    onChange("");
  }

  const resolvedSrc = value || "";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-rapid-text">
        {label}
      </label>

      {resolvedSrc ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedSrc}
            alt={label}
            className="h-20 w-auto rounded-lg border border-rapid-border object-contain bg-white p-1"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
            title="Quitar imagen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-rapid-border rounded-lg cursor-pointer hover:border-rapid-primary hover:bg-rapid-primary/5 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-rapid-primary" />
              <span className="text-sm text-rapid-text-muted">Subiendo...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-rapid-text-muted" />
              <span className="text-sm text-rapid-text-muted">
                Clic para subir imagen
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
        disabled={uploading}
      />

      {hint && !error && !uploadError && (
        <p className="text-xs text-rapid-text-muted">{hint}</p>
      )}
      {(error || uploadError) && (
        <p className="text-xs text-red-600">{error || uploadError}</p>
      )}
    </div>
  );
}
