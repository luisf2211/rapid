"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Ban, Printer } from "lucide-react";
import Link from "next/link";
import {
  markInvoicePaidAction,
  voidInvoiceAction,
} from "@/app/(app)/invoices/actions";

export function InvoiceDetailActions({
  invoiceId,
  status,
}: {
  invoiceId: number;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showVoid, setShowVoid] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  const canPay = status === "INVOICED" || status === "PENDING";
  const canVoid = status === "INVOICED" || status === "PENDING";

  function handlePay() {
    setError(null);
    startTransition(async () => {
      const res = await markInvoicePaidAction(invoiceId, paymentRef || undefined);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleVoid() {
    setError(null);
    startTransition(async () => {
      const res = await voidInvoiceAction(invoiceId, voidReason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setShowVoid(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/print/invoices/${invoiceId}`}
          target="_blank"
          className="btn-secondary"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </Link>
        {canPay && (
          <button
            type="button"
            className="btn-primary"
            disabled={pending}
            onClick={handlePay}
          >
            <Check className="w-4 h-4" />
            Marcar pagada
          </button>
        )}
        {canVoid && !showVoid && (
          <button
            type="button"
            className="btn-secondary text-red-700 border-red-200"
            disabled={pending}
            onClick={() => setShowVoid(true)}
          >
            <Ban className="w-4 h-4" />
            Anular
          </button>
        )}
      </div>

      {canPay && (
        <input
          type="text"
          placeholder="Referencia de pago (opcional)"
          className="form-input max-w-xs text-sm"
          value={paymentRef}
          onChange={(e) => setPaymentRef(e.target.value)}
        />
      )}

      {showVoid && (
        <div className="card p-4 border-red-200 bg-red-50/50 max-w-md">
          <p className="text-sm font-medium text-red-900 mb-2">Anular factura</p>
          <textarea
            className="form-input w-full text-sm min-h-[72px]"
            placeholder="Motivo de anulación..."
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => setShowVoid(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary text-sm bg-red-700 hover:bg-red-800"
              disabled={pending || !voidReason.trim()}
              onClick={handleVoid}
            >
              Confirmar anulación
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
