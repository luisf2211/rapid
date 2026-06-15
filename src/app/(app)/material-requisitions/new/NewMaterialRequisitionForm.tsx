"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Boxes,
  Package,
} from "lucide-react";
import {
  materialRequisitionFormSchema,
  toMaterialRequisitionInput,
  type MaterialRequisitionInput,
  type MaterialRequisitionFormValues,
} from "@/lib/validations/material-requisition";
import type { InventoryPartOption } from "@/lib/inventory/client";
import { formatMoney } from "@/lib/formatters/money";
import { parseFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { requisitionLineTotal } from "@/lib/material-requisition/line-total";
import { MATERIAL_REQUISITION_LINE_TYPES } from "@/lib/constants";
import { createMaterialRequisitionAction } from "../actions";
import { RequisitionLinesEditor } from "@/components/material-requisition/RequisitionLinesEditor";

interface WorkOrderOption {
  id: number;
  orderNumber: number;
  customerName: string;
  brand: string;
  model: string;
  plate: string;
}

interface Props {
  workOrders: WorkOrderOption[];
  materialParts: InventoryPartOption[];
  paintParts: InventoryPartOption[];
  initialWorkOrderId?: number;
}

const emptyLine = () => ({
  inventoryPartId: 0,
  quantity: 1,
  unitPrice: 0,
  assignedEmployee: "",
});

export function NewMaterialRequisitionForm({
  workOrders,
  materialParts,
  paintParts,
  initialWorkOrderId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const materialById = useMemo(
    () => new Map(materialParts.map((p) => [p.id, p])),
    [materialParts],
  );
  const paintById = useMemo(
    () => new Map(paintParts.map((p) => [p.id, p])),
    [paintParts],
  );

  const form = useForm<MaterialRequisitionFormValues>({
    resolver: zodResolver(materialRequisitionFormSchema),
    mode: "onBlur",
    defaultValues: {
      workOrderId: initialWorkOrderId ?? workOrders[0]?.id ?? 0,
      materialItems: materialParts.length > 0 ? [emptyLine()] : [],
      paintItems: paintParts.length > 0 ? [emptyLine()] : [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  const materialFields = useFieldArray({ control, name: "materialItems" });
  const paintFields = useFieldArray({ control, name: "paintItems" });
  const watchedMaterial = useWatch({ control, name: "materialItems" });
  const watchedPaint = useWatch({ control, name: "paintItems" });

  const total = useMemo(() => {
    const sumLines = (
      lines: typeof watchedMaterial,
      lineType: typeof MATERIAL_REQUISITION_LINE_TYPES.MATERIAL | typeof MATERIAL_REQUISITION_LINE_TYPES.PAINT,
    ) =>
      (lines ?? []).reduce(
        (acc, it) =>
          acc + requisitionLineTotal(lineType, it?.quantity, it?.unitPrice),
        0,
      );
    return (
      sumLines(watchedMaterial, MATERIAL_REQUISITION_LINE_TYPES.MATERIAL) +
      sumLines(watchedPaint, MATERIAL_REQUISITION_LINE_TYPES.PAINT)
    );
  }, [watchedMaterial, watchedPaint]);

  const onMaterialPartChange = (idx: number, partId: number) => {
    const part = materialById.get(partId);
    if (!part) return;
    setValue(`materialItems.${idx}.inventoryPartId`, partId, {
      shouldValidate: true,
    });
    if (part.unitCost != null) {
      setValue(`materialItems.${idx}.unitPrice`, part.unitCost);
    }
  };

  const onPaintPartChange = (idx: number, partId: number) => {
    const part = paintById.get(partId);
    if (!part) return;
    setValue(`paintItems.${idx}.inventoryPartId`, partId, {
      shouldValidate: true,
    });
    if (part.unitCost != null) {
      setValue(`paintItems.${idx}.unitPrice`, part.unitCost);
    }
  };

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createMaterialRequisitionAction(
        toMaterialRequisitionInput(data),
      );
      if (result.ok) {
        router.push(`/work-orders/${result.workOrderId}`);
      } else {
        setSubmitError(result.error);
      }
    });
  });

  if (materialParts.length === 0 && paintParts.length === 0) {
    return (
      <div className="card p-10 text-center">
        <Package className="w-10 h-10 text-rapid-text-muted mx-auto mb-3" />
        <p className="font-semibold text-rapid-text">Sin inventario registrado</p>
        <p className="text-sm text-rapid-text-muted mt-1 max-w-md mx-auto">
          Registra materiales y pintura antes de crear una requisición.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <Link href="/inventory/new" className="btn-secondary inline-flex">
            Material
          </Link>
          <Link href="/inventory/paint/new" className="btn-primary inline-flex">
            Pintura
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-12">
      {submitError && (
        <div className="card border-red-200 bg-red-50 p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              No se pudo guardar la requisición
            </p>
            <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <section className="card p-5">
        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-rapid-border">
          <div className="w-10 h-10 rounded-xl bg-rapid-green-soft text-rapid-green-dark flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Cabecera de la requisición</h2>
            <p className="text-sm text-rapid-text-muted">
              Orden de recepción vinculada
            </p>
          </div>
        </div>

        <div>
          <label className="form-label">Orden relacionada *</label>
          <select
            className="form-input"
            {...register("workOrderId")}
            disabled={workOrders.length === 0}
          >
            {workOrders.length === 0 && (
              <option value="">No hay órdenes disponibles</option>
            )}
            {workOrders.map((wo) => (
              <option key={wo.id} value={wo.id}>
                #{String(wo.orderNumber).padStart(5, "0")} · {wo.customerName}{" "}
                · {wo.brand} {wo.model} ({wo.plate})
              </option>
            ))}
          </select>
          {errors.workOrderId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.workOrderId.message}
            </p>
          )}
        </div>
      </section>

      <RequisitionLinesEditor
        title="Materiales"
        subtitle="Consumibles y piezas del inventario general. Descuenta stock al guardar."
        fieldName="materialItems"
        parts={materialParts}
        fields={materialFields.fields}
        watched={watchedMaterial}
        control={control}
        register={register}
        errors={errors}
        partById={materialById}
        onAppend={() => materialFields.append(emptyLine())}
        onRemove={(idx) => materialFields.remove(idx)}
        onPartChange={onMaterialPartChange}
      />

      <RequisitionLinesEditor
        title="Pintura"
        subtitle="Productos del inventario de pintura. El costo es por unidad completa al utilizar."
        fieldName="paintItems"
        parts={paintParts}
        fields={paintFields.fields}
        watched={watchedPaint}
        control={control}
        register={register}
        errors={errors}
        partById={paintById}
        onAppend={() => paintFields.append(emptyLine())}
        onRemove={(idx) => paintFields.remove(idx)}
        onPartChange={onPaintPartChange}
        paintPricing
      />

      {(errors.materialItems?.message || errors.paintItems?.message) && (
        <p className="text-xs text-red-600">
          {errors.materialItems?.message ?? errors.paintItems?.message}
        </p>
      )}

      <div className="card sticky bottom-4 lg:bottom-2 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="text-xs text-rapid-text-muted">Total de la requisición</p>
          <p className="text-3xl font-bold text-rapid-green-dark">
            {formatMoney(total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/material-requisitions" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending || workOrders.length === 0}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Guardando..." : "Guardar requisición"}
          </button>
        </div>
      </div>
    </form>
  );
}
