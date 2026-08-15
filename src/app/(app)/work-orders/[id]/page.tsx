import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Wrench,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Fuel,
  User,
  Plus,
  Check,
  Receipt,
  Printer,
  Eye,
  Pencil,
  FileText,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getWorkOrderById,
  getWorkOrderFinancialSummary,
} from "@/services/work-orders.service";
import {
  getActiveInvoiceForWorkOrder,
  getLatestInvoiceForWorkOrder,
} from "@/services/invoices.service";
import { InvoiceStatusBadge } from "@/components/invoice/InvoiceStatusBadge";
import {
  checklistDisplayItems,
  checklistRowsToDetails,
  isChecklistIncomplete,
} from "@/lib/checklist";
import { formatMoney } from "@/lib/formatters/money";
import { laborOrderWorkerName } from "@/lib/labor-order/worker-name";
import {
  formatPieceCount,
  laborItemLineAmount,
  laborItemQuantity,
  laborItemUnitPrice,
  sumLaborOrderAmount,
  sumLaborOrderPieces,
} from "@/lib/labor-order/piece-count";
import { canEditLaborOrder } from "@/lib/labor-order/can-edit";
import { canEditWorkOrderReception } from "@/lib/work-order/can-edit";
import { formatMileage } from "@/lib/work-order/mileage";
import { canEditQuotation } from "@/lib/quotation/form-mapper";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { splitRequisitionItems } from "@/lib/material-requisition/line-type";
import { formatDocNumber } from "@/lib/quotation/print-data";
import {
  WORK_ORDER_STATUS_LABELS,
  DAMAGE_SIDES,
  DAMAGE_TYPES,
  PHOTO_TYPES,
} from "@/lib/constants";
import { Tabs } from "./Tabs";
import { changeWorkOrderStatusAction } from "../actions";
import { PhotoPreview } from "@/components/ui/PhotoPreview";
import { PrintSelect, ShareSelect } from "@/components/quotation/QuotationActionSelects";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const sideMap = Object.fromEntries(
  DAMAGE_SIDES.map((s) => [s.value, s.label]),
);
const damageTypeMap = Object.fromEntries(
  DAMAGE_TYPES.map((d) => [d.value, d.label]),
);
const photoTypeMap = Object.fromEntries(
  PHOTO_TYPES.map((p) => [p.value, p.label]),
);

function formatTime(value: Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default async function WorkOrderDetailPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const order = await getWorkOrderById(id);
  if (!order) notFound();

  const financial = await getWorkOrderFinancialSummary(order.id);
  const activeInvoice = await getActiveInvoiceForWorkOrder(order.id);
  const latestInvoice =
    activeInvoice ?? (await getLatestInvoiceForWorkOrder(order.id));
  const reception = order.receptions[0] ?? null;
  const receptionEditable = canEditWorkOrderReception(order.status);
  const checklistPending = isChecklistIncomplete(reception?.checklist);
  const linkedQuotation = getLinkedQuotation(order);
  const quotationEditable =
    linkedQuotation != null && canEditQuotation(linkedQuotation.status);

  const orderNumber = `ORD-${String(order.orderNumber).padStart(5, "0")}`;
  const vehicleTitle = `${order.brand ?? ""} ${order.model ?? ""} ${order.vehicleYear ?? ""}`.trim() || "Vehículo";

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Link
        href="/work-orders"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-rapid-text-muted hover:text-rapid-text transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Órdenes de recepción
      </Link>

      {/* ─── Header card ──────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: identity */}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-rapid-text">
                {vehicleTitle}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-rapid-text-muted mt-0.5">
              {orderNumber}
              <span className="mx-1.5 text-rapid-border">·</span>
              {order.customerName ?? "Sin cliente"}
              {order.plate && (
                <>
                  <span className="mx-1.5 text-rapid-border">·</span>
                  <span className="font-mono text-xs font-semibold">{order.plate}</span>
                </>
              )}
              <span className="mx-1.5 text-rapid-border">·</span>
              {formatDateTime(order.createdAt)}
            </p>
          </div>

          {/* Right: financial + status */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-semibold tabular-nums text-rapid-text">
                {formatMoney(financial.grandTotal)}
              </p>
              <p className="text-[11px] text-rapid-text-muted">costo interno</p>
            </div>
            <form
              action={changeWorkOrderStatusAction}
              className="flex items-center gap-1.5"
            >
              <input type="hidden" name="id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="form-input h-9 text-sm min-w-[130px]"
              >
                {Object.entries(WORK_ORDER_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button
                type="submit"
                aria-label="Guardar estado"
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-4 pt-4 border-t border-rapid-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: document actions */}
          <div className="flex items-center">
            {receptionEditable && (
              <Link
                href={`/work-orders/${order.id}/edit`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </Link>
            )}
            <WorkOrderPrintSelect orderId={order.id} />
            <ShareSelect
              phone={order.phone}
              customerName={order.customerName ?? "Cliente"}
              printPath={`/print/work-orders/${order.id}`}
            />
            {linkedQuotation && (
              <Link
                href={`/quotations/${linkedQuotation.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Cotización
              </Link>
            )}
          </div>

          {/* Right: workflow actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/material-requisitions/new?workOrderId=${order.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rapid-text-muted border border-rapid-border hover:bg-rapid-surface transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
              Materiales
            </Link>
            <Link
              href={`/labor-orders/new?workOrderId=${order.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rapid-text-muted border border-rapid-border hover:bg-rapid-surface transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Mano de obra
            </Link>
            {latestInvoice ? (
              <Link
                href={`/invoices/${latestInvoice.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rapid-text-muted border border-rapid-border hover:bg-rapid-surface transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                FAC-{String(latestInvoice.invoiceNumber).padStart(5, "0")}
              </Link>
            ) : (
              <Link
                href={`/invoices/new?workOrderId=${order.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                Facturar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── Checklist alert ──────────────────────────────────────── */}
      {receptionEditable && checklistPending && (
        <div className="card border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-amber-800">
            <p className="font-medium">Checklist de recepción pendiente</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Completa la inspección del vehículo antes de continuar.
            </p>
          </div>
          <Link
            href={`/work-orders/${order.id}/edit#checklist`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors shrink-0"
          >
            Completar checklist
          </Link>
        </div>
      )}

      {/* ─── Tabs (main content focus) ────────────────────────────── */}
      <Tabs
        tabs={[
          {
            id: "recepcion",
            label: "Recepción",
            content: (
              <ReceptionTab
                order={order}
                reception={reception}
                linkedQuotation={linkedQuotation}
                quotationEditable={quotationEditable}
              />
            ),
          },
          {
            id: "checklist",
            label: "Checklist",
            count:
              reception?.checklist.filter(
                (c) => c.isChecked || c.hasComment || c.comments,
              ).length ?? 0,
            content: <ChecklistTab reception={reception} />,
          },
          {
            id: "damages",
            label: "Daños",
            count: order.damages.length,
            content: <DamagesTab order={order} />,
          },
          {
            id: "photos",
            label: "Fotos",
            count: order.photos.length,
            content: <PhotosTab order={order} />,
          },
          {
            id: "materials",
            label: "Materiales",
            count: order.materialRequisitions.length,
            content: <MaterialsTab order={order} />,
          },
          {
            id: "labor",
            label: "Mano de obra",
            count: order.laborOrders.length,
            content: (
              <LaborTab
                order={order}
                invoiceStatus={latestInvoice?.status}
              />
            ),
          },
          {
            id: "summary",
            label: "Resumen",
            content: (
              <FinancialTab
                order={order}
                financial={financial}
                latestInvoice={latestInvoice}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

// ─── Helpers & sub-components ─────────────────────────────────────────────────

type WorkOrder = NonNullable<Awaited<ReturnType<typeof getWorkOrderById>>>;
type Reception = WorkOrder["receptions"][number];
type Financial = Awaited<ReturnType<typeof getWorkOrderFinancialSummary>>;
type LinkedQuotation = {
  id: number;
  quotationNumber: number;
  quotationType: string;
  status: string;
};

function getLinkedQuotation(order: WorkOrder): LinkedQuotation | null {
  if (order.quotation) return order.quotation;
  const fromConversion = order.convertedFrom[0];
  return fromConversion ?? null;
}

function WorkOrderPrintSelect({ orderId }: { orderId: number }) {
  return (
    <Link
      href={`/print/work-orders/${orderId}`}
      target="_blank"
      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors"
    >
      <Printer className="w-3.5 h-3.5" />
      Imprimir
    </Link>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-rapid-hairline last:border-0">
      <div className="shrink-0 w-7 h-7 rounded-lg bg-rapid-surface-strong flex items-center justify-center text-rapid-text-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-rapid-text-muted">{label}</p>
        <p className="text-sm font-medium text-rapid-text break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Tab content components ───────────────────────────────────────────────────

function ReceptionTab({
  order,
  reception,
  linkedQuotation,
  quotationEditable,
}: {
  order: WorkOrder;
  reception: Reception | null;
  linkedQuotation: LinkedQuotation | null;
  quotationEditable: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">Cliente</h3>
        <InfoRow icon={<User className="w-4 h-4" />} label="Nombre" value={order.customerName ?? "—"} />
        <InfoRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={order.phone ?? "—"} />
        <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={order.email ?? "—"} />
        <InfoRow icon={<MapPin className="w-4 h-4" />} label="Dirección" value={order.address ?? "—"} />
      </div>

      <div className="card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">Vehículo y recepción</h3>
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Entrada"
          value={reception ? `${formatDate(reception.deliveryDate)} · ${formatTime(reception.deliveryTime)}` : "—"}
        />
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Salida"
          value={reception?.exitDate ? `${formatDate(reception.exitDate)} · ${formatTime(reception.exitTime)}` : "—"}
        />
        <InfoRow
          icon={<Fuel className="w-4 h-4" />}
          label="Combustible"
          value={reception?.fuelLevel != null ? `${reception.fuelLevel}%` : "—"}
        />
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="Recibido por"
          value={reception?.receivedBy ?? "—"}
        />
      </div>

      {(reception?.requestedDamages || reception?.observations || order.notes) && (
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">Observaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {reception?.requestedDamages && (
              <div>
                <p className="text-[11px] font-medium text-rapid-text-muted mb-1">Daños solicitados</p>
                <p className="whitespace-pre-wrap">{reception.requestedDamages}</p>
              </div>
            )}
            {reception?.observations && (
              <div>
                <p className="text-[11px] font-medium text-rapid-text-muted mb-1">Observaciones</p>
                <p className="whitespace-pre-wrap">{reception.observations}</p>
              </div>
            )}
            {order.notes && (
              <div className="md:col-span-2">
                <p className="text-[11px] font-medium text-rapid-text-muted mb-1">Notas internas</p>
                <p className="whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistTab({ reception }: { reception: Reception | null }) {
  const { checked, comments, present } = checklistRowsToDetails(reception?.checklist);
  const items = checklistDisplayItems(present);
  const total = items.length;
  const checkedCount = items.filter((it) => checked[it.field]).length;
  const commentCount = items.filter((it) => comments[it.field]).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-rapid-text">Checklist de recepción</h3>
          <p className="text-sm text-rapid-text-muted">
            {checkedCount} de {total} verificados
            {commentCount > 0 && ` · ${commentCount} con comentario`}
          </p>
        </div>
        <p className="text-xl font-semibold text-emerald-600">
          {total > 0 ? Math.round((checkedCount / total) * 100) : 0}%
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map((item) => {
          const ok = checked[item.field];
          const comment = comments[item.field];
          return (
            <div
              key={item.field}
              className={`rounded-lg border p-3 text-sm ${
                ok
                  ? "border-emerald-200 bg-emerald-50/50"
                  : comment
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-rapid-border bg-rapid-bg/40 text-rapid-text-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    ok ? "bg-emerald-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {ok && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span className="font-medium text-rapid-text">{item.label}</span>
              </div>
              {comment && (
                <p className="mt-2 text-xs text-rapid-text leading-relaxed pl-6 border-l-2 border-emerald-300">
                  {comment}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DamagesTab({ order }: { order: WorkOrder }) {
  if (order.damages.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-rapid-text-muted">No se registraron daños en esta orden.</p>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-rapid-surface-soft text-xs uppercase tracking-wider text-rapid-text-muted">
          <tr>
            <th className="text-left font-semibold px-5 py-3">Lado</th>
            <th className="text-left font-semibold px-5 py-3">Tipo</th>
            <th className="text-left font-semibold px-5 py-3">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {order.damages.map((d) => (
            <tr key={d.id} className="border-t border-rapid-border">
              <td className="px-5 py-3 font-medium">
                {d.vehicleSide ? sideMap[d.vehicleSide] ?? d.vehicleSide : "—"}
              </td>
              <td className="px-5 py-3">
                {d.damageType ? damageTypeMap[d.damageType] ?? d.damageType : "—"}
              </td>
              <td className="px-5 py-3 text-rapid-text-muted">{d.description || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhotosTab({ order }: { order: WorkOrder }) {
  if (order.photos.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-rapid-text-muted">No hay fotos registradas para esta orden.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {order.photos.map((p) => (
        <div key={p.id} className="card overflow-hidden">
          <div className="relative aspect-video bg-rapid-bg">
            <PhotoPreview
              src={p.photoUrl}
              alt={p.description ?? "Foto"}
              className="absolute inset-0 w-full h-full object-cover"
              expandable
            />
          </div>
          <div className="p-3">
            <p className="text-xs font-medium text-rapid-text">
              {p.photoType ? photoTypeMap[p.photoType] ?? p.photoType : "Foto"}
            </p>
            {p.description && (
              <p className="text-xs text-rapid-text-muted mt-0.5 truncate">{p.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RequisitionItemsTable({
  title,
  items,
}: {
  title: string;
  items: WorkOrder["materialRequisitions"][number]["items"];
}) {
  if (items.length === 0) return null;
  const subtotal = items.reduce((acc, it) => acc + Number(it.total ?? 0), 0);

  return (
    <>
      <div className="px-5 py-2 bg-rapid-surface-soft border-b border-rapid-border">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">{title}</p>
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-rapid-text-muted">
          <tr>
            <th className="text-left font-semibold px-5 py-2">Producto</th>
            <th className="text-right font-semibold px-5 py-2">Cant.</th>
            <th className="text-right font-semibold px-5 py-2">Precio</th>
            <th className="text-right font-semibold px-5 py-2">Total</th>
            <th className="text-left font-semibold px-5 py-2">Asignado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t border-rapid-border">
              <td className="px-5 py-2 font-medium">{it.productName}</td>
              <td className="px-5 py-2 text-right tabular-nums">
                {it.quantity != null ? formatFractionQuantity(Number(it.quantity)) : "—"}
              </td>
              <td className="px-5 py-2 text-right tabular-nums">{formatMoney(Number(it.unitPrice ?? 0))}</td>
              <td className="px-5 py-2 text-right tabular-nums font-semibold">{formatMoney(Number(it.total ?? 0))}</td>
              <td className="px-5 py-2 text-rapid-text-muted">{it.assignedEmployee || "—"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-rapid-border bg-rapid-surface-soft">
            <td colSpan={3} className="px-5 py-2 text-right text-xs font-semibold text-rapid-text-muted">
              Subtotal {title.toLowerCase()}
            </td>
            <td className="px-5 py-2 text-right font-bold tabular-nums">{formatMoney(subtotal)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </>
  );
}

function MaterialsTab({ order }: { order: WorkOrder }) {
  if (order.materialRequisitions.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-rapid-text-muted mb-3">Aún no hay requisiciones de materiales.</p>
        <Link href={`/material-requisitions/new?workOrderId=${order.id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
          <Plus className="w-4 h-4" /> Crear requisición
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {order.materialRequisitions.map((req) => {
        const { materialItems, paintItems } = splitRequisitionItems(req.items);
        return (
          <div key={req.id} className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-rapid-border flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-semibold">Requisición #{String(req.id).padStart(5, "0")}</p>
                <p className="text-xs text-rapid-text-muted">{formatDateTime(req.createdAt)}</p>
              </div>
              <p className="font-semibold tabular-nums">{formatMoney(Number(req.total ?? 0))}</p>
            </div>
            <RequisitionItemsTable title="Materiales" items={materialItems} />
            <RequisitionItemsTable title="Pintura" items={paintItems} />
          </div>
        );
      })}
    </div>
  );
}

function LaborTab({ order, invoiceStatus }: { order: WorkOrder; invoiceStatus?: string | null }) {
  const laborEditable = canEditLaborOrder(invoiceStatus);
  if (order.laborOrders.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-rapid-text-muted mb-3">Aún no hay órdenes de mano de obra.</p>
        <Link href={`/labor-orders/new?workOrderId=${order.id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
          <Plus className="w-4 h-4" /> Crear mano de obra
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {order.laborOrders.map((lo) => (
        <div key={lo.id} className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-rapid-border flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-semibold">MO-{String(lo.id).padStart(5, "0")}</p>
              <p className="text-sm font-medium mt-0.5">{laborOrderWorkerName(lo)}</p>
              <p className="text-xs text-rapid-text-muted">{formatDateTime(lo.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Link href={`/labor-orders/${lo.id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Ver
                </Link>
                {laborEditable && (
                  <Link href={`/labor-orders/${lo.id}/edit`} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Link>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">{formatMoney(sumLaborOrderAmount(lo.items))}</p>
                <p className="text-xs text-rapid-text-muted">{formatPieceCount(sumLaborOrderPieces(lo.items))} pzas.</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-rapid-text-muted">
                <tr>
                  <th className="text-left font-semibold px-5 py-2">Pieza</th>
                  <th className="text-right font-semibold px-5 py-2">Cant.</th>
                  <th className="text-right font-semibold px-5 py-2">Precio</th>
                  <th className="text-right font-semibold px-5 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {lo.items.map((it) => (
                  <tr key={it.id} className="border-t border-rapid-border">
                    <td className="px-5 py-2 font-medium">{it.partName}</td>
                    <td className="px-5 py-2 text-right tabular-nums">{formatPieceCount(laborItemQuantity(it))}</td>
                    <td className="px-5 py-2 text-right tabular-nums">{formatMoney(laborItemUnitPrice(it))}</td>
                    <td className="px-5 py-2 text-right tabular-nums font-semibold">{formatMoney(laborItemLineAmount(it))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

type LatestInvoice = Awaited<ReturnType<typeof getLatestInvoiceForWorkOrder>>;

function FinancialTab({
  order,
  financial,
  latestInvoice,
}: {
  order: WorkOrder;
  financial: Financial;
  latestInvoice: LatestInvoice;
}) {
  return (
    <div className="space-y-4">
      {latestInvoice && (
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">Factura</p>
            <p className="text-lg font-semibold mt-1">FAC-{String(latestInvoice.invoiceNumber).padStart(5, "0")}</p>
            <div className="flex items-center gap-2 mt-1">
              <InvoiceStatusBadge status={latestInvoice.status} />
              <span className="text-xs text-rapid-text-muted">{formatDate(latestInvoice.invoiceDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/invoices/${latestInvoice.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rapid-text-muted border border-rapid-border hover:bg-rapid-surface transition-colors">
              Ver factura
            </Link>
            <Link href={`/print/invoices/${latestInvoice.id}`} target="_blank" className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors">
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs font-medium text-rapid-text-muted">Materiales</p>
          <p className="text-xl font-semibold mt-1.5 tabular-nums">{formatMoney(financial.totalMaterials)}</p>
          <p className="text-[11px] text-rapid-text-muted mt-1">{order.materialRequisitions.length} requisición(es)</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-rapid-text-muted">Pintura</p>
          <p className="text-xl font-semibold mt-1.5 tabular-nums">{formatMoney(financial.totalPaint)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-rapid-text-muted">Mano de obra</p>
          <p className="text-xl font-semibold mt-1.5 tabular-nums">{formatMoney(financial.totalLaborAmount)}</p>
          <p className="text-[11px] text-rapid-text-muted mt-1">{formatPieceCount(financial.totalLaborPieces)} piezas</p>
        </div>
        <div className="card p-4 border-l-4 border-l-emerald-400">
          <p className="text-xs font-medium text-rapid-text-muted">Total interno</p>
          <p className="text-xl font-semibold mt-1.5 tabular-nums text-emerald-700">{formatMoney(financial.grandTotal)}</p>
        </div>
      </div>
    </div>
  );
}
