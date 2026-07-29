"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createBankAccountAction } from "@/app/(app)/banks/actions";
import { BANK_ACCOUNT_TYPES, CURRENCIES } from "@/lib/validations/bank";

export function CreateBankAccountDialog() {
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("CHECKING");
  const [currency, setCurrency] = useState("DOP");
  const [initialBalance, setInitialBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createBankAccountAction({
        accountName,
        bankName,
        accountNumber,
        accountType,
        currency,
        initialBalance: parseFloat(initialBalance) || 0,
        notes,
      });
      if (result.ok) {
        setOpen(false);
        resetForm();
      } else {
        setError(result.error);
      }
    });
  };

  const resetForm = () => {
    setAccountName("");
    setBankName("");
    setAccountNumber("");
    setAccountType("CHECKING");
    setCurrency("DOP");
    setInitialBalance("");
    setNotes("");
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="w-4 h-4" />
        Nueva cuenta
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Nueva cuenta bancaria</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rapid-bg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <div>
          <label className="form-label">Nombre de la cuenta *</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Cuenta operativa principal"
            className="form-input w-full"
            required
          />
        </div>
        <div>
          <label className="form-label">Banco *</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Banco Popular, BHD León..."
            className="form-input w-full"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Tipo de cuenta</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="form-input w-full"
            >
              {BANK_ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="form-input w-full"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Número de cuenta</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Opcional"
            className="form-input w-full"
          />
        </div>
        <div>
          <label className="form-label">Balance inicial</label>
          <input
            type="number"
            step="0.01"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="0.00"
            className="form-input w-full"
          />
        </div>
        <div>
          <label className="form-label">Notas</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional"
            className="form-input w-full"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? "Creando..." : "Crear cuenta"}
          </button>
        </div>
      </form>
    </div>
  );
}
