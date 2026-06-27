"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteQuotationAction } from "@/app/(app)/quotations/actions";

export function QuotationListDeleteButton({
  quotationId,
  quotationNumber,
  customerName,
  iconOnly = false,
}: {
  quotationId: number;
  quotationNumber: number;
  customerName: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (
      !window.confirm(
        `¿Eliminar cotización #${quotationNumber} (${customerName})?`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteQuotationAction(quotationId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  if (iconOnly) {
    return (
      <span className="relative inline-flex flex-col items-center">
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          aria-label="Eliminar cotización"
          className="p-2 rounded-lg text-red-600/80 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {error && (
          <span className="absolute top-full right-0 mt-1 text-[10px] text-red-600 whitespace-nowrap z-10 bg-white px-1 rounded shadow">
            {error}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {pending ? "..." : "Eliminar"}
      </button>
      {error && (
        <span className="text-[10px] text-red-600 max-w-[120px] text-right">
          {error}
        </span>
      )}
    </span>
  );
}
