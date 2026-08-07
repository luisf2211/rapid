"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Plus, Printer, Banknote } from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { formatMoney } from "@/lib/formatters/money";
import { invoicePaymentSchema, PAYMENT_METHODS, type InvoicePaymentInput } from "@/lib/validations/invoice-payment";
import { createPaymentAction } from "./payment-actions";

type PaymentRow = {
  Id: number;
  PaymentNumber: number;
  Amount: number;
  PaymentMethod: string;
  BankName: string | null;
  Reference: string | null;
  Concept: string | null;
  ReceivedBy: string | null;
  DeliveredBy: string | null;
  PaymentDate: Date;
};

interface Props {
  invoiceId: number;
  invoiceNumber: number;
  payments: PaymentRow[];
  grandTotal: number;
  totalPaid: number;
  balance: number;
  invoiceStatus: string;
}

function methodLabel(method: string): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

export function InvoicePaymentsSection({
  invoiceId,
  invoiceNumber,
  payments,
  grandTotal,
  totalPaid,
  balance,
  invoiceStatus,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canPay = invoiceStatus !== "VOID" && invoiceStatus !== "PAID" && balance > 0;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoicePaymentInput>({
    resolver: zodResolver(invoicePaymentSchema),
    defaultValues: { amount: balance, paymentMethod: "CASH" },
  });

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = await createPaymentAction(invoiceId, data);
      if (result.ok) {
        setShowForm(false);
        reset({ amount: 0, paymentMethod: "CASH" });
      } else {
        setError(result.error);
      }
    });
  });

  return (
    <div className="card mt-4 overflow-hidden">
      <div className="px-5 py-3 border-b border-rapid-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-rapid-text-muted" />
          <h2 className="font-bold">Abonos</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-rapid-text-muted">Pagado: </span>
            <span className="font-semibold text-rapid-green">{formatMoney(totalPaid)}</span>
            <span className="text-rapid-text-muted ml-2">Saldo: </span>
            <span className="font-semibold text-red-600">{formatMoney(balance)}</span>
          </div>
          {canPay && (
            <button type="button" className="btn-primary text-xs" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Abonar
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="px-5 py-4 border-b border-rapid-border bg-rapid-surface-soft space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <MoneyInput label="Monto *" {...register("amount")} error={errors.amount?.message} />
              <div>
                <label className="form-label">Metodo de pago *</label>
                <select {...register("paymentMethod")} className="form-input w-full">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <TextInput label="Banco" {...register("bankName")} />
              <TextInput label="Referencia" {...register("reference")} />
              <TextInput label="Concepto" {...register("concept")} />
              <TextInput label="Fecha" type="date" {...register("paymentDate")} />
              <TextInput label="Recibido por" {...register("receivedBy")} />
              <TextInput label="Entregado por" {...register("deliveredBy")} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={isPending}>
                {isPending ? "Guardando..." : "Registrar abono"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments list */}
      {payments.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-rapid-text-muted">
          No hay abonos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-rapid-text-muted bg-rapid-surface-soft">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">#</th>
                <th className="text-left px-4 py-2.5 font-semibold">Fecha</th>
                <th className="text-left px-4 py-2.5 font-semibold">Metodo</th>
                <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">Referencia</th>
                <th className="text-right px-4 py-2.5 font-semibold">Monto</th>
                <th className="px-4 py-2.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.Id} className="border-t border-rapid-border">
                  <td className="px-4 py-2.5 font-mono text-xs">{p.PaymentNumber}</td>
                  <td className="px-4 py-2.5">{new Date(p.PaymentDate).toLocaleDateString("es-DO")}</td>
                  <td className="px-4 py-2.5">{methodLabel(p.PaymentMethod)}</td>
                  <td className="px-4 py-2.5 text-rapid-text-muted hidden md:table-cell">
                    {p.Reference || p.BankName || "\u2014"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {formatMoney(p.Amount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/print/invoice-payments/${p.Id}?auto=1`}
                      target="_blank"
                      className="p-1.5 rounded hover:bg-rapid-surface text-rapid-text-muted hover:text-rapid-text"
                      title="Imprimir recibo"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
