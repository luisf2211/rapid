"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteInventoryPartAction } from "../actions";

interface Props {
  partId: number;
  partName: string;
  movementCount: number;
  quantityOnHand: number;
  reservedQuantity: number;
}

export function DeleteInventoryPartButton({
  partId,
  partName,
  movementCount,
  quantityOnHand,
  reservedQuantity,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canHardDelete =
    movementCount === 0 && quantityOnHand === 0 && reservedQuantity === 0;

  const confirmMessage = canHardDelete
    ? `¿Eliminar permanentemente "${partName}"? Esta acción no se puede deshacer.`
    : movementCount > 0
      ? `"${partName}" tiene historial de movimientos. Se desactivará en el inventario (no se borra el historial). ¿Continuar?`
      : `Para eliminar "${partName}" primero deja el stock en cero.`;

  const handleClick = () => {
    if (!canHardDelete && movementCount === 0) {
      setError(
        "Registra un ajuste de inventario a cero antes de eliminar la pieza.",
      );
      return;
    }
    if (!window.confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteInventoryPartAction(partId);
      if (result.ok) {
        if (result.mode === "deleted") {
          router.push("/inventory");
          router.refresh();
        } else {
          router.push("/inventory?filter=inactive");
          router.refresh();
        }
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="card p-5 border-red-100">
      <h3 className="font-semibold text-rapid-text">Eliminar pieza</h3>
      <p className="text-sm text-rapid-text-muted mt-1">
        {canHardDelete
          ? "Sin movimientos ni stock. Se eliminará de la base de datos."
          : movementCount > 0
            ? "Con historial solo se puede desactivar; el registro y movimientos se conservan."
            : "Con stock o reservas pendientes no se puede eliminar."}
      </p>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || (!canHardDelete && movementCount === 0)}
        className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {isPending
          ? "Procesando..."
          : canHardDelete
            ? "Eliminar permanentemente"
            : movementCount > 0
              ? "Desactivar pieza"
              : "Eliminar"}
      </button>
    </div>
  );
}
