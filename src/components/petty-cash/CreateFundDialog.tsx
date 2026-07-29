"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createPettyCashFundAction } from "@/app/(app)/petty-cash/actions";

export function CreateFundDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [fundLimit, setFundLimit] = useState("");
  const [custodian, setCustodian] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPettyCashFundAction({
        name,
        fundLimit: parseFloat(fundLimit),
        custodian,
      });
      if (result.ok) {
        setOpen(false);
        setName("");
        setFundLimit("");
        setCustodian("");
      } else {
        setError(result.error);
      }
    });
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="w-4 h-4" />
        Nuevo fondo
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Nuevo fondo de caja chica</h2>
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
          <label className="form-label">Nombre del fondo *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Caja chica principal"
            className="form-input w-full"
            required
          />
        </div>
        <div>
          <label className="form-label">Límite del fondo (RD$) *</label>
          <input
            type="number"
            step="0.01"
            value={fundLimit}
            onChange={(e) => setFundLimit(e.target.value)}
            placeholder="5000.00"
            className="form-input w-full"
            required
          />
        </div>
        <div>
          <label className="form-label">Custodio</label>
          <input
            type="text"
            value={custodian}
            onChange={(e) => setCustodian(e.target.value)}
            placeholder="Nombre del responsable"
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
            {isPending ? "Creando..." : "Crear fondo"}
          </button>
        </div>
      </form>
    </div>
  );
}
