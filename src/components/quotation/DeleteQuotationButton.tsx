"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteQuotationAction } from "@/app/(app)/quotations/actions";

export function DeleteQuotationButton({
  quotationId,
  quotationNumber,
  customerName,
  redirectTo = "/quotations",
  className = "btn-secondary text-red-700 border-red-200 hover:bg-red-50",
}: {
  quotationId: number;
  quotationNumber: number;
  customerName: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    const msg = `¿Eliminar cotización #${quotationNumber}?`;
    if (!window.confirm(msg)) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteQuotationAction(quotationId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <Trash2 className="w-4 h-4" />
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
