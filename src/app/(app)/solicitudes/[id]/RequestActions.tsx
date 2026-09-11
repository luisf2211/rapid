"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Phone, X } from "lucide-react";
import { acceptRequestAction, rejectRequestAction } from "../actions";

interface Props {
  id: number;
  phone: string | null;
}

export function RequestActions({ id, phone }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const res = await acceptRequestAction(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Abre el editor de cotización con los datos del cliente precargados.
      router.push(`/quotations/${res.id}/edit`);
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectRequestAction(id, reason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/solicitudes");
    });
  }

  return (
    <div className="card mt-4 p-6">
      <p className="section-label mb-1">Revisar solicitud</p>
      <p className="mb-4 text-sm text-rapid-text-muted">
        Acéptala para convertirla en una cotización y ponerle precios, o
        recházala con un motivo que verá el cliente.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-rapid-error/30 bg-rapid-error-soft px-4 py-3 text-sm text-rapid-error">
          {error}
        </div>
      )}

      {!rejecting ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleAccept}
            disabled={pending}
            className="btn-primary"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Aceptar y cotizar
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="btn-secondary"
          >
            <X className="h-4 w-4" />
            Rechazar
          </button>
          {phone && (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="btn-ghost sm:ml-auto"
            >
              <Phone className="h-4 w-4" />
              Llamar al cliente
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="form-label" htmlFor="reason">
              Motivo del rechazo
            </label>
            <textarea
              id="reason"
              rows={3}
              className="form-input"
              placeholder="Ej: No trabajamos ese tipo de reparación por el momento."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReject}
              disabled={pending || !reason.trim()}
              className="btn-danger"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Confirmar rechazo
            </button>
            <button
              type="button"
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
              disabled={pending}
              className="btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
