"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { QuotationStatusBadge } from "@/components/ui/QuotationStatusBadge";
import { formatMoney } from "@/lib/formatters/money";
import { QUOTATION_TYPES } from "@/lib/constants";
import {
  canDeleteQuotation,
  canEditQuotation,
} from "@/lib/quotation/form-mapper";
import { QuotationListDeleteButton } from "./QuotationListDeleteButton";

export type QuotationListItem = {
  id: number;
  quotationNumber: number;
  customerName: string;
  brand: string | null;
  model: string | null;
  plate: string | null;
  quotationType: string;
  status: string;
  grandTotal: number;
  workOrderId: number | null;
};

function typeLabel(type: string) {
  return QUOTATION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function QuotationsTable({ items }: { items: QuotationListItem[] }) {
  const router = useRouter();

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rapid-border bg-rapid-surface text-left text-xs uppercase tracking-wide text-rapid-text-muted">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Vehículo</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 w-20" aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr
                key={q.id}
                onClick={() => router.push(`/quotations/${q.id}`)}
                className="border-b border-rapid-border last:border-0 hover:bg-rapid-green-soft/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5 font-semibold text-rapid-green">
                  {q.quotationNumber}
                </td>
                <td className="px-4 py-3.5 font-medium text-rapid-text">
                  {q.customerName}
                </td>
                <td className="px-4 py-3.5 text-rapid-text-muted hidden md:table-cell">
                  {[q.brand, q.model, q.plate].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  {typeLabel(q.quotationType)}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold tabular-nums">
                  {formatMoney(q.grandTotal)}
                </td>
                <td className="px-4 py-3.5">
                  <QuotationStatusBadge status={q.status} />
                </td>
                <td
                  className="px-2 py-3.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-0.5">
                    {canEditQuotation(q.status) && (
                      <Link
                        href={`/quotations/${q.id}/edit`}
                        className="p-2 rounded-lg text-rapid-text-muted hover:bg-white hover:text-rapid-text"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    )}
                    {canDeleteQuotation(q.status, q.workOrderId) && (
                      <QuotationListDeleteButton
                        quotationId={q.id}
                        quotationNumber={q.quotationNumber}
                        customerName={q.customerName}
                        iconOnly
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2.5 text-xs text-rapid-text-muted border-t border-rapid-border bg-rapid-surface/50">
        Toca una fila para abrir la cotización.
      </p>
    </div>
  );
}
