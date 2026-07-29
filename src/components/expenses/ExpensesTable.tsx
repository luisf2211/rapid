"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/formatters/money";
import { useTransition } from "react";
import { deleteExpenseAction } from "@/app/(app)/expenses/actions";
import { EXPENSE_PAYMENT_METHODS } from "@/lib/validations/expense";

type ExpenseRow = {
  id: number;
  expenseNumber: number;
  description: string;
  amount: number;
  expenseDateLabel: string;
  categoryName: string;
  categoryColor: string;
  supplier: string | null;
  paymentMethod: string | null;
};

const methodLabel = (method: string | null) => {
  if (!method) return "—";
  return (
    EXPENSE_PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method
  );
};

export function ExpensesTable({ items }: { items: ExpenseRow[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rapid-border text-left text-xs uppercase tracking-wider text-rapid-text-muted">
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Categoría</th>
            <th className="px-4 py-3 font-semibold">Descripción</th>
            <th className="px-4 py-3 font-semibold">Proveedor</th>
            <th className="px-4 py-3 font-semibold">Método</th>
            <th className="px-4 py-3 font-semibold text-right">Monto</th>
            <th className="px-4 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rapid-border">
          {items.map((item) => (
            <ExpenseRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpenseRow({ item }: { item: ExpenseRow }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("¿Eliminar este gasto? Esta acción no se puede deshacer."))
      return;
    startTransition(async () => {
      await deleteExpenseAction(item.id);
    });
  };

  return (
    <tr className={isPending ? "opacity-50" : "hover:bg-rapid-bg/50"}>
      <td className="px-4 py-3 font-mono text-xs text-rapid-text-muted">
        GAS-{String(item.expenseNumber).padStart(4, "0")}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{item.expenseDateLabel}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.categoryColor }}
          />
          {item.categoryName}
        </span>
      </td>
      <td className="px-4 py-3 max-w-[200px] truncate">{item.description}</td>
      <td className="px-4 py-3 text-rapid-text-muted">
        {item.supplier || "—"}
      </td>
      <td className="px-4 py-3 text-rapid-text-muted">
        {methodLabel(item.paymentMethod)}
      </td>
      <td className="px-4 py-3 text-right font-mono font-semibold text-red-600 tabular-nums">
        {formatMoney(item.amount)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/expenses/${item.id}/edit`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-rapid-bg text-rapid-text-muted hover:text-rapid-text"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-rapid-text-muted hover:text-red-600"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
