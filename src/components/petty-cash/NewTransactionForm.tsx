"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { formatMoney } from "@/lib/formatters/money";
import { createPettyCashTransactionAction } from "@/app/(app)/petty-cash/actions";
import { PETTY_CASH_TRANSACTION_TYPES } from "@/lib/validations/petty-cash";

interface Props {
  fundId: number;
  currentBalance: number;
  fundLimit: number;
}

export function NewTransactionForm({ fundId, currentBalance, fundLimit }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"DISBURSEMENT" | "REPLENISHMENT">("DISBURSEMENT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPettyCashTransactionAction({
        pettyCashFundId: fundId,
        transactionType: type,
        amount: parseFloat(amount),
        description,
        transactionDate: date,
        notes,
      });
      if (result.ok) {
        setAmount("");
        setDescription("");
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
          {PETTY_CASH_TRANSACTION_TYPES.map((t) => (
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
        <p className="text-[11px] text-rapid-text-muted mt-1">
          {type === "DISBURSEMENT"
            ? `Disponible: ${formatMoney(currentBalance)}`
            : `Máximo reposición: ${formatMoney(fundLimit - currentBalance)}`}
        </p>
      </div>

      <div>
        <label className="form-label">Descripción *</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Almuerzo, tornillos..."
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
