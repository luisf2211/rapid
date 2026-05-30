"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ClipboardList } from "lucide-react";
import {
  approveQuotationAction,
  convertQuotationAction,
  rejectQuotationAction,
} from "@/app/(app)/quotations/actions";

export function QuotationWorkflowActions({
  id,
  status,
  workOrderId,
  workOrderNumber,
}: {
  id: number;
  status: string;
  workOrderId?: number | null;
  workOrderNumber?: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const run = (
    fn: () => Promise<{ ok: boolean; error?: string; workOrderId?: number }>,
  ) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? "Error");
        return;
      }
      if (res.workOrderId) {
        router.push(`/work-orders/${res.workOrderId}`);
        return;
      }
      router.refresh();
    });
  };

  if (status === "CONVERTED" && workOrderId) {
    return (
      <Link
        href={`/work-orders/${workOrderId}`}
        className="btn-primary inline-flex items-center gap-2"
      >
        <ClipboardList className="w-4 h-4" />
        Ver recepción #{workOrderNumber ?? workOrderId}
      </Link>
    );
  }

  if (status === "CONVERTED") {
    return (
      <p className="text-sm text-rapid-text-muted">Ya convertida a recepción.</p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(status === "DRAFT" || status === "PENDING") && (
          <>
            <button
              type="button"
              className="btn-primary"
              disabled={pending}
              onClick={() => run(() => approveQuotationAction(id))}
            >
              <Check className="w-4 h-4" />
              Aprobar
            </button>
            {!rejectOpen ? (
              <button
                type="button"
                className="btn-secondary"
                disabled={pending}
                onClick={() => setRejectOpen(true)}
              >
                Rechazar
              </button>
            ) : null}
          </>
        )}

        {status === "APPROVED" && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={() => run(() => convertQuotationAction(id))}
          >
            <ClipboardList className="w-4 h-4" />
            Crear recepción
          </button>
        )}

        {status === "REJECTED" && (
          <p className="text-sm text-rapid-text-muted">Cotización rechazada.</p>
        )}
      </div>

      {rejectOpen && (status === "DRAFT" || status === "PENDING") && (
        <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <input
            className="form-input flex-1"
            placeholder="Motivo (opcional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              className="btn-dark"
              disabled={pending}
              onClick={() => run(() => rejectQuotationAction(id, rejectReason))}
            >
              Confirmar
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={pending}
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
