"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ClipboardList, Send } from "lucide-react";
import {
  approveQuotationAction,
  convertQuotationAction,
  rejectQuotationAction,
  sendQuoteToCustomerAction,
} from "@/app/(app)/quotations/actions";

export function QuotationWorkflowActions({
  id,
  status,
  workOrderId,
  workOrderNumber,
  canSendToCustomer = false,
}: {
  id: number;
  status: string;
  workOrderId?: number | null;
  workOrderNumber?: number | null;
  canSendToCustomer?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
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
        router.push(`/work-orders/${res.workOrderId}/edit#checklist`);
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
        {canSendToCustomer &&
          status !== "CONVERTED" &&
          status !== "REJECTED" && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-rapid-green text-white hover:bg-rapid-green-dark transition-colors disabled:opacity-60"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const res = await sendQuoteToCustomerAction(id);
                  if (res.ok) setSent(true);
                  return res;
                })
              }
            >
              <Send className="w-4 h-4" />
              {sent ? "Reenviar al cliente" : "Enviar cotización al cliente"}
            </button>
          )}

        {(status === "DRAFT" || status === "PENDING") && (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              disabled={pending}
              onClick={() => run(() => approveQuotationAction(id))}
            >
              <Check className="w-4 h-4" />
              Aprobar
            </button>
            {!rejectOpen ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-rapid-text-muted border border-rapid-border hover:bg-rapid-surface transition-colors"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
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
