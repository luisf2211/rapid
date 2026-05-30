"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoiceAction } from "../actions";

type WorkOrderOption = {
  id: number;
  orderNumber: number;
  customerName: string;
  plate: string | null;
  brand: string | null;
  model: string | null;
  laborCount: number;
  materialCount: number;
};

export function NewInvoiceForm({
  workOrders,
  initialWorkOrderId,
}: {
  workOrders: WorkOrderOption[];
  initialWorkOrderId?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [workOrderId, setWorkOrderId] = useState(
    initialWorkOrderId ? String(initialWorkOrderId) : "",
  );
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");

  const selected = workOrders.find((o) => o.id === Number(workOrderId));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createInvoiceAction({
        workOrderId: Number(workOrderId),
        discountAmount: Number(discount) || 0,
        notes,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/invoices/${res.id}`);
      router.refresh();
    });
  }

  if (workOrders.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-rapid-text-muted">
        No hay órdenes listas para facturar. Registra mano de obra o materiales
        en una orden de recepción primero.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div className="card p-5 space-y-4">
        <div>
          <label className="form-label">Orden de recepción</label>
          <select
            className="form-input w-full"
            required
            value={workOrderId}
            onChange={(e) => setWorkOrderId(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {workOrders.map((o) => (
              <option key={o.id} value={o.id}>
                ORD-{String(o.orderNumber).padStart(5, "0")} — {o.customerName}
                {o.plate ? ` · ${o.plate}` : ""}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <p className="text-sm text-rapid-text-muted">
            {selected.brand} {selected.model} · MO: {selected.laborCount} ·
            Materiales: {selected.materialCount}
          </p>
        )}

        <div>
          <label className="form-label">Descuento (RD$)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="form-input w-full max-w-xs"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Notas (opcional)</label>
          <textarea
            className="form-input w-full min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <p className="text-xs text-rapid-text-muted">
          La factura incluirá todas las líneas de mano de obra y materiales de la
          orden. Particulares sin ITBIS; aseguradoras con 18%.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={pending || !workOrderId}>
        {pending ? "Generando..." : "Generar factura"}
      </button>
    </form>
  );
}
