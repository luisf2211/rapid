"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";

/** Extrae el token de un link completo o de un código pegado directo. */
function extractToken(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const match = /\/rastrear\/([a-z0-9]+)/i.exec(value);
  if (match) return match[1];
  // Si pegaron solo el código
  if (/^[a-z0-9]{16,40}$/i.test(value)) return value;
  return null;
}

export function TrackLookupForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = extractToken(value);
    if (!token) {
      setError("Revisa el enlace o código e intenta de nuevo.");
      return;
    }
    router.push(`/rastrear/${token}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="Enlace o código de seguimiento"
        placeholder="https://…/rastrear/abc123  o  abc123"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        error={error ?? undefined}
        autoFocus
      />
      <button type="submit" className="btn-primary w-full">
        Ver estado
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
