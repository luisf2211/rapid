"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createBankTransactionAction } from "@/app/(app)/banks/actions";
import { TRANSACTION_TYPES } from "@/lib/validations/bank";

interface Props {
  bankAccountId: number;
}

export function NewBankTransactionForm({ bankAccountId }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createBankTransactionAction({
        bankAccountId,
        transactionType: type,
        amount: parseFloat(amount),
        description,
        reference,
        transactionDate: date,
        category,
        notes,
      });
      if (result.ok) {
        setAmount("");
        setDescription("");
        setReference("");
        setCategory("");
        setNotes("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div>
        <label className="form-label">Tipo *</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="form-input w-full"
        >
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Monto *</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="form-label">Descripción *</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Depósito, pago proveedor..."
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="form-label">Fecha *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label className="form-label">Referencia</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="No. transferencia, cheque..."
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="form-label">Categoría</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Pago proveedor, nómina..."
          className="form-input w-full"
        />
      </div>

      <div>
        <label className="form-label">Notas</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opcional..."
          className="form-input w-full"
        />
      </div>

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Registrando..." : "Registrar"}
      </button>
    </form>
  );
}
