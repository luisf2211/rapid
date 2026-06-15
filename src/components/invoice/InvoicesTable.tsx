"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/formatters/money";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

export type InvoiceTableRow = {
  id: number;
  invoiceNumber: number;
  invoiceDateLabel: string;
  customerName: string;
  plate: string | null;
  billingType: string;
  status: string;
  grandTotal: number;
  workOrderId: number;
  orderNumber: number;
};

const billingLabels: Record<string, string> = {
  PRIVATE: "Particular",
  INSURANCE: "Aseguradora",
};

export function InvoicesTable({ items }: { items: InvoiceTableRow[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rapid-border bg-rapid-surface/50 text-left text-xs uppercase tracking-wider text-rapid-text-muted">
              <th className="px-4 py-3 font-semibold">No.</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Orden</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold text-right">Total</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-rapid-border/60 hover:bg-rapid-surface/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/invoices/${row.id}`}
                    className="font-mono font-semibold text-rapid-text hover:underline"
                  >
                    FAC-{String(row.invoiceNumber).padStart(5, "0")}
                  </Link>
                </td>
                <td className="px-4 py-3 text-rapid-text-muted">
                  {row.invoiceDateLabel}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/invoices/${row.id}`} className="hover:underline">
                    {row.customerName}
                  </Link>
                  {row.plate && (
                    <span className="block text-xs text-rapid-text-muted font-mono">
                      {row.plate}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/work-orders/${row.workOrderId}`}
                    className="text-xs font-mono text-rapid-text-muted hover:underline"
                  >
                    ORD-{String(row.orderNumber).padStart(5, "0")}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs">
                  {billingLabels[row.billingType] ?? row.billingType}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {formatMoney(row.grandTotal)}
                </td>
                <td className="px-4 py-3">
                  <InvoiceStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
