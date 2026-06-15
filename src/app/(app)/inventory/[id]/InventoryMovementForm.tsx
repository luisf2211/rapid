"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inventoryMovementSchema,
  type InventoryMovementInput,
  type InventoryMovementFormValues,
} from "@/lib/validations/inventory";
import {
  INVENTORY_MOVEMENT_REASONS,
  INVENTORY_MOVEMENT_TYPES,
} from "@/lib/constants";
import { TextInput } from "@/components/forms/TextInput";
import { FractionQuantityInput } from "@/components/forms/FractionQuantityInput";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { createInventoryMovementAction } from "../actions";

interface WorkOrderOption {
  id: number;
  orderNumber: number;
  label: string;
}

interface Props {
  partId: number;
  currentStock: number;
  reservedQuantity: number;
  workOrders: WorkOrderOption[];
}

export function InventoryMovementForm({
  partId,
  currentStock,
  reservedQuantity,
  workOrders,
}: Props) {
  const available = currentStock - reservedQuantity;
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<InventoryMovementFormValues, unknown, InventoryMovementInput>({
    resolver: zodResolver(inventoryMovementSchema),
    defaultValues: {
      inventoryPartId: partId,
      movementType: INVENTORY_MOVEMENT_TYPES.IN,
      quantity: 1,
      unitCostAtMovement: "",
      reason: "",
      workOrderId: "",
      notes: "",
      createdBy: "",
    },
  });

  const movementType = watch("movementType");

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createInventoryMovementAction({
        ...data,
        inventoryPartId: partId,
      });
      if (result.ok) {
        setSuccess(true);
        reset({
          inventoryPartId: partId,
          movementType: INVENTORY_MOVEMENT_TYPES.IN,
          quantity: 1,
          unitCostAtMovement: "",
          reason: "",
          workOrderId: "",
          notes: "",
          createdBy: "",
        });
      } else {
        setSubmitError(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-rapid-text">Registrar movimiento</h3>
        <p className="text-sm text-rapid-text-muted mt-0.5">
          Existencia:{" "}
          <span className="font-semibold tabular-nums">
            {formatFractionQuantity(currentStock)}
          </span>
          {reservedQuantity > 0 && (
            <>
              {" "}
              · Reservado:{" "}
              <span className="font-semibold tabular-nums">
                {formatFractionQuantity(reservedQuantity)}
              </span>
            </>
          )}
          {" "}
          · Disponible:{" "}
          <span className="font-semibold tabular-nums">
            {formatFractionQuantity(available)}
          </span>
        </p>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      {success && (
        <p className="text-sm text-rapid-green-dark">Movimiento registrado.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="form-label">Tipo *</label>
          <select className="form-input" {...register("movementType")}>
            <option value={INVENTORY_MOVEMENT_TYPES.IN}>Entrada (+)</option>
            <option value={INVENTORY_MOVEMENT_TYPES.OUT}>Salida (−)</option>
            <option value={INVENTORY_MOVEMENT_TYPES.ADJUST}>
              Ajuste (fijar stock exacto)
            </option>
          </select>
        </div>
        <FractionQuantityInput
          label={
            movementType === INVENTORY_MOVEMENT_TYPES.ADJUST
              ? "Nuevo stock *"
              : "Cantidad *"
          }
          {...register("quantity")}
          error={errors.quantity?.message}
        />
        <div>
          <label className="form-label">Motivo</label>
          <select className="form-input" {...register("reason")}>
            <option value="">—</option>
            {INVENTORY_MOVEMENT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {movementType === INVENTORY_MOVEMENT_TYPES.IN && (
          <TextInput
            label="Costo unitario (movimiento)"
            type="number"
            step="0.01"
            min="0"
            {...register("unitCostAtMovement")}
          />
        )}
        {(movementType === INVENTORY_MOVEMENT_TYPES.OUT ||
          watch("reason") === "WORK_ORDER") && (
          <Controller
            control={control}
            name="workOrderId"
            render={({ field }) => (
              <div className="sm:col-span-2">
                <label className="form-label">Orden relacionada</label>
                <select
                  className="form-input"
                  value={field.value != null ? String(field.value) : ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                >
                  <option value="">Sin orden</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        )}
        <TextInput label="Registrado por" {...register("createdBy")} />
        <TextInput
          label="Notas"
          {...register("notes")}
          containerClassName="sm:col-span-2"
        />
      </div>

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Guardando..." : "Registrar"}
      </button>
    </form>
  );
}
