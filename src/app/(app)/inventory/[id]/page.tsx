import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  availableQuantity,
  getInventoryPartById,
} from "@/services/inventory.service";
import { listWorkOrders } from "@/services/work-orders.service";
import { formatDateTime } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";
import {
  INVENTORY_MOVEMENT_LABELS,
  INVENTORY_MOVEMENT_REASONS,
} from "@/lib/constants";
import { serializeInventoryPartForClient } from "@/lib/inventory/client";
import { isPaintPartType, partTypeLabel } from "@/lib/inventory/part-type";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { toPlainNumber } from "@/lib/serialize";
import { DeleteInventoryPartButton } from "./DeleteInventoryPartButton";
import { EditInventoryPartForm } from "./EditInventoryPartForm";
import { InventoryMovementForm } from "./InventoryMovementForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InventoryPartPage({ params }: PageProps) {
  const { id } = await params;
  const partId = Number(id);
  if (!Number.isFinite(partId)) notFound();

  const part = await getInventoryPartById(partId).catch(() => null);
  if (!part) notFound();

  let workOrders: Awaited<ReturnType<typeof listWorkOrders>> = [];
  try {
    workOrders = await listWorkOrders({ take: 50 });
  } catch {
    workOrders = [];
  }

  const woOptions = workOrders.map((wo) => ({
    id: wo.id,
    orderNumber: wo.orderNumber,
    label: `#${String(wo.orderNumber).padStart(5, "0")} · ${wo.customerName ?? "—"} · ${wo.plate ?? ""}`,
  }));

  const partClient = serializeInventoryPartForClient(part);
  const stock = partClient.quantityOnHand;
  const reserved = partClient.reservedQuantity;
  const available = availableQuantity(stock, reserved);
  const low =
    partClient.minQuantity != null && available <= partClient.minQuantity;

  const reasonLabel = Object.fromEntries(
    INVENTORY_MOVEMENT_REASONS.map((r) => [r.value, r.label]),
  );

  const isPaint = isPaintPartType(partClient.partType);
  const inventoryBackHref = isPaint ? "/inventory/paint" : "/inventory";

  return (
    <>
      <PageHeader
        title={part.name}
        subtitle={
          part.sku
            ? `Código ${part.sku} · ${partTypeLabel(partClient.partType)}${part.category ? ` · ${part.category}` : ""}`
            : partTypeLabel(partClient.partType)
        }
        actions={
          <Link href={inventoryBackHref} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />{" "}
            {isPaint ? "Inventario pintura" : "Inventario"}
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm text-rapid-text-muted">Disponible</p>
          <p
            className={`text-3xl font-bold tabular-nums mt-1 ${low ? "text-amber-700" : "text-rapid-text"}`}
          >
            {formatFractionQuantity(available)}{" "}
            <span className="text-lg font-medium">{part.unit}</span>
          </p>
          <p className="text-xs text-rapid-text-muted mt-1">
            Existencia: {formatFractionQuantity(stock)}
            {reserved > 0 && ` · Reservado: ${formatFractionQuantity(reserved)}`}
          </p>
          {partClient.minQuantity != null && (
            <p className="text-xs text-rapid-text-muted mt-1">
              Mínimo: {formatFractionQuantity(partClient.minQuantity)} {part.unit}
            </p>
          )}
          {part.location && (
            <p className="text-xs text-rapid-text-muted mt-1">
              Ubicación: {part.location}
            </p>
          )}
        </div>
        <div className="card p-5">
          <p className="text-sm text-rapid-text-muted">Costo unitario</p>
          <p className="text-xl font-semibold mt-1">
            {partClient.unitCost != null
              ? formatMoney(partClient.unitCost)
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          <EditInventoryPartForm part={partClient} />
          <DeleteInventoryPartButton
            partId={part.id}
            partName={part.name}
            movementCount={part._count.movements}
            quantityOnHand={stock}
            reservedQuantity={reserved}
          />
        </div>
        <InventoryMovementForm
          partId={part.id}
          currentStock={stock}
          reservedQuantity={reserved}
          workOrders={woOptions}
        />
      </div>

      <section className="card overflow-hidden mt-4">
        <div className="px-5 py-3.5 border-b border-rapid-border">
          <h2 className="font-semibold">Historial de movimientos</h2>
        </div>
        {part.movements.length === 0 ? (
          <p className="p-8 text-sm text-rapid-text-muted text-center">
            Sin movimientos registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rapid-bg/60 text-xs text-rapid-text-muted">
                <tr>
                  <th className="text-left font-medium px-5 py-2">Fecha</th>
                  <th className="text-left font-medium px-5 py-2">Tipo</th>
                  <th className="text-left font-medium px-5 py-2">Motivo</th>
                  <th className="text-right font-medium px-5 py-2">Cant.</th>
                  <th className="text-right font-medium px-5 py-2">Antes</th>
                  <th className="text-right font-medium px-5 py-2">Después</th>
                  <th className="text-left font-medium px-5 py-2">Orden</th>
                  <th className="text-left font-medium px-5 py-2">Notas</th>
                </tr>
              </thead>
              <tbody>
                {part.movements.map((m) => (
                  <tr key={m.id} className="border-t border-rapid-border">
                    <td className="px-5 py-2 text-xs text-rapid-text-muted whitespace-nowrap">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="px-5 py-2">
                      {INVENTORY_MOVEMENT_LABELS[m.movementType] ??
                        m.movementType}
                    </td>
                    <td className="px-5 py-2 text-xs text-rapid-text-muted">
                      {m.reason
                        ? (reasonLabel[m.reason] ?? m.reason)
                        : "—"}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums font-medium">
                      {formatFractionQuantity(toPlainNumber(m.quantity))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums text-rapid-text-muted">
                      {formatFractionQuantity(toPlainNumber(m.quantityBefore))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums font-semibold">
                      {formatFractionQuantity(toPlainNumber(m.quantityAfter))}
                    </td>
                    <td className="px-5 py-2 text-xs">
                      {m.workOrder ? (
                        <Link
                          href={`/work-orders/${m.workOrderId}`}
                          className="text-rapid-green-dark hover:underline font-mono"
                        >
                          #
                          {String(m.workOrder.orderNumber).padStart(5, "0")}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-2 text-rapid-text-muted text-xs max-w-[200px] truncate">
                      {[
                        m.notes,
                        m.createdBy,
                        toPlainNumber(m.unitCostAtMovement) != null
                          ? formatMoney(toPlainNumber(m.unitCostAtMovement)!)
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
