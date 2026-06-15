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
import { PageHeader } from "@/components/ui/PageHeader";
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
import { checklistRowsToDetails, isChecklistIncomplete } from "@/lib/checklist";
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
import { canEditQuotation } from "@/lib/quotation/form-mapper";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { formatFractionQuantity } from "@/lib/formatters/fraction-quantity";
import { splitRequisitionItems } from "@/lib/material-requisition/line-type";
import { formatDocNumber } from "@/lib/quotation/print-data";
import {
  CHECKLIST_ITEMS,
  FUEL_LEVELS,
  WORK_ORDER_STATUS_LABELS,
  DAMAGE_SIDES,
  DAMAGE_TYPES,
  PHOTO_TYPES,
} from "@/lib/constants";
import { Tabs } from "./Tabs";
import { changeWorkOrderStatusAction } from "../actions";
import { PhotoPreview } from "@/components/ui/PhotoPreview";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const fuelMap = Object.fromEntries(FUEL_LEVELS.map((f) => [f.value, f.label]));
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

  return (
    <>
      <PageHeader
        title={`${order.brand ?? ""} ${order.model ?? ""} ${
          order.vehicleYear ?? ""
        }`.trim() || "Orden de trabajo"}
        subtitle={`Orden #${String(order.orderNumber).padStart(5, "0")} · ${
          order.customerName ?? "Sin cliente"
        }`}
        badge={<StatusBadge status={order.status} />}
        actions={
          <>
            <Link href="/work-orders" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
            <Link
              href={`/print/work-orders/${order.id}`}
              target="_blank"
              className="btn-secondary"
            >
              <Printer className="w-4 h-4" /> Imprimir recepción
            </Link>
            {linkedQuotation && (
              <>
                <Link
                  href={`/quotations/${linkedQuotation.id}`}
                  className="btn-secondary"
                >
                  <FileText className="w-4 h-4" />{" "}
                  {formatDocNumber(
                    linkedQuotation.quotationType,
                    linkedQuotation.quotationNumber,
                  )}
                </Link>
                {quotationEditable && (
                  <Link
                    href={`/quotations/${linkedQuotation.id}/edit?returnTo=/work-orders/${order.id}`}
                    className="btn-secondary"
                  >
                    <Pencil className="w-4 h-4" /> Editar cotización
                  </Link>
                )}
              </>
            )}
            {receptionEditable && (
              <Link
                href={`/work-orders/${order.id}/edit`}
                className="btn-primary"
              >
                <Pencil className="w-4 h-4" /> Editar recepción
              </Link>
            )}
            <Link
              href={`/material-requisitions/new?workOrderId=${order.id}`}
              className="btn-secondary"
            >
              <Boxes className="w-4 h-4" /> Materiales
            </Link>
            <Link
              href={`/labor-orders/new?workOrderId=${order.id}`}
              className="btn-primary"
            >
              <Wrench className="w-4 h-4" /> Mano de obra
            </Link>
            {latestInvoice && (
              <Link
                href={`/invoices/${latestInvoice.id}`}
                className="btn-secondary"
              >
                <Receipt className="w-4 h-4" /> Ver factura FAC-
                {String(latestInvoice.invoiceNumber).padStart(5, "0")}
              </Link>
            )}
            {!activeInvoice && (
              <Link
                href={`/invoices/new?workOrderId=${order.id}`}
                className="btn-secondary"
              >
                <Receipt className="w-4 h-4" /> Facturar
              </Link>
            )}
          </>
        }
      />

      {receptionEditable && checklistPending && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Checklist de recepción pendiente</p>
            <p className="mt-0.5 text-amber-800">
              Completa la inspección del vehículo antes de continuar con el
              trabajo en taller.
            </p>
          </div>
          <Link
            href={`/work-orders/${order.id}/edit#checklist`}
            className="btn-primary shrink-0"
          >
            Completar checklist
          </Link>
        </div>
      )}

      {/* Top summary panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Vehículo
            </p>
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-rapid-black text-rapid-green">
              {order.plate ?? "—"}
            </span>
          </div>
          <p className="text-2xl font-bold text-rapid-text">
            {order.brand ?? ""} {order.model ?? ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <InfoMini
              label="Año"
              value={order.vehicleYear ? String(order.vehicleYear) : "—"}
            />
            <InfoMini label="Color" value={order.color ?? "—"} />
            <InfoMini label="Motor" value={order.engine ?? "—"} />
            <InfoMini label="Millaje" value={order.mileage ?? "—"} />
          </div>
        </div>

        <div className="surface-dark p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
            Costos internos
          </p>
          <p className="text-3xl font-bold mt-2 text-rapid-green">
            {formatMoney(financial.grandTotal)}
          </p>
          <div className="mt-4 space-y-1.5 text-xs text-white/70">
            <div className="flex justify-between">
              <span>Materiales</span>
              <span className="font-mono text-white">
                {formatMoney(financial.totalMaterials)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pintura</span>
              <span className="font-mono text-white">
                {formatMoney(financial.totalPaint)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mano de obra</span>
              <span className="font-mono text-white">
                {formatMoney(financial.totalLaborAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Piezas MO</span>
              <span className="font-mono text-white">
                {formatPieceCount(financial.totalLaborPieces)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status changer */}
      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
          Estado de la orden
        </p>
        <form
          action={changeWorkOrderStatusAction}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="id" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="form-input py-1.5"
          >
            {Object.entries(WORK_ORDER_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-dark text-xs px-3 py-1.5">
            Actualizar
          </button>
        </form>
        <span className="ml-auto text-xs text-rapid-text-muted">
          Creada {formatDateTime(order.createdAt)}
        </span>
      </div>

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
            label: "Resumen financiero",
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
    </>
  );
}

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

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-rapid-text-muted">
        {label}
      </p>
      <p className="text-sm font-medium text-rapid-text mt-0.5">{value}</p>
    </div>
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
    <div className="flex items-start gap-3 py-2.5 border-b border-rapid-border last:border-0">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-rapid-bg flex items-center justify-center text-rapid-text-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-rapid-text-muted">
          {label}
        </p>
        <p className="text-sm font-medium text-rapid-text break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

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
      {linkedQuotation && (
        <div className="card p-5 lg:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">Cotización de origen</h3>
            <p className="text-sm text-rapid-text-muted">
              Presupuesto vinculado a esta hoja de recepción
            </p>
            <p className="font-mono text-sm font-semibold mt-2">
              {formatDocNumber(
                linkedQuotation.quotationType,
                linkedQuotation.quotationNumber,
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 min-w-0">
            <Link
              href={`/quotations/${linkedQuotation.id}`}
              className="btn-primary"
            >
              <Eye className="w-4 h-4" /> Ver cotización
            </Link>
            {quotationEditable && (
              <Link
                href={`/quotations/${linkedQuotation.id}/edit?returnTo=/work-orders/${order.id}`}
                className="btn-secondary"
              >
                <Pencil className="w-4 h-4" /> Editar cotización
              </Link>
            )}
            <Link
              href={`/print/quotations/${linkedQuotation.id}?auto=1`}
              target="_blank"
              className="btn-secondary"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </Link>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-bold text-lg mb-1">Cliente</h3>
        <p className="text-sm text-rapid-text-muted mb-3">
          Información de contacto
        </p>
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="Nombre"
          value={order.customerName ?? "—"}
        />
        <InfoRow
          icon={<Phone className="w-4 h-4" />}
          label="Teléfono"
          value={order.phone ?? "—"}
        />
        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          value={order.email ?? "—"}
        />
        <InfoRow
          icon={<MapPin className="w-4 h-4" />}
          label="Dirección"
          value={order.address ?? "—"}
        />
      </div>

      <div className="card p-5">
        <h3 className="font-bold text-lg mb-1">Recepción</h3>
        <p className="text-sm text-rapid-text-muted mb-3">Datos de entrada</p>
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Fecha y hora de entrada"
          value={
            reception
              ? `${formatDate(reception.deliveryDate)} · ${formatTime(
                  reception.deliveryTime,
                )}`
              : "—"
          }
        />
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Fecha y hora de salida"
          value={
            reception && reception.exitDate
              ? `${formatDate(reception.exitDate)} · ${formatTime(
                  reception.exitTime,
                )}`
              : "—"
          }
        />
        <InfoRow
          icon={<Fuel className="w-4 h-4" />}
          label="Nivel de combustible"
          value={
            reception?.fuelLevel
              ? fuelMap[reception.fuelLevel] ?? reception.fuelLevel
              : "—"
          }
        />
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="Recibido por"
          value={reception?.receivedBy ?? "—"}
        />
      </div>

      <div className="card p-5 lg:col-span-2">
        <h3 className="font-bold text-lg mb-3">Observaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-rapid-text-muted">
              Daños solicitados
            </p>
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {reception?.requestedDamages || "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-rapid-text-muted">
              Observaciones
            </p>
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {reception?.observations || "—"}
            </p>
          </div>
        </div>
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-rapid-border">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-rapid-text-muted">
              Notas internas
            </p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistTab({ reception }: { reception: Reception | null }) {
  const { checked, comments } = checklistRowsToDetails(reception?.checklist);
  const total = CHECKLIST_ITEMS.length;
  const checkedCount = CHECKLIST_ITEMS.filter((it) => checked[it.field]).length;
  const commentCount = CHECKLIST_ITEMS.filter(
    (it) => comments[it.field],
  ).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">Checklist de recepción</h3>
          <p className="text-sm text-rapid-text-muted">
            {checkedCount} de {total} verificados
            {commentCount > 0 && ` · ${commentCount} con comentario`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-rapid-green-dark">
            {Math.round((checkedCount / total) * 100)}%
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {CHECKLIST_ITEMS.map((item) => {
          const ok = checked[item.field];
          const comment = comments[item.field];
          return (
            <div
              key={item.field}
              className={`rounded-lg border p-3 text-sm ${
                ok
                  ? "border-rapid-green/30 bg-rapid-green-soft/40"
                  : comment
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-rapid-border bg-rapid-bg/40 text-rapid-text-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    ok ? "bg-rapid-green text-white" : "bg-gray-200"
                  }`}
                >
                  {ok && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span className="font-semibold text-rapid-text">{item.label}</span>
              </div>
              {comment && (
                <p className="mt-2 text-xs text-rapid-text leading-relaxed pl-6 border-l-2 border-rapid-green/40">
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
        <p className="text-sm text-rapid-text-muted">
          No se registraron daños en esta orden.
        </p>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-rapid-bg/60 text-xs uppercase tracking-wider text-rapid-text-muted">
          <tr>
            <th className="text-left font-semibold px-5 py-3">Lado</th>
            <th className="text-left font-semibold px-5 py-3">Tipo</th>
            <th className="text-left font-semibold px-5 py-3">Descripción</th>
            <th className="text-right font-semibold px-5 py-3">Pos. X</th>
            <th className="text-right font-semibold px-5 py-3">Pos. Y</th>
          </tr>
        </thead>
        <tbody>
          {order.damages.map((d) => (
            <tr
              key={d.id}
              className="border-t border-rapid-border hover:bg-rapid-bg/30"
            >
              <td className="px-5 py-3 font-medium">
                {d.vehicleSide
                  ? sideMap[d.vehicleSide] ?? d.vehicleSide
                  : "—"}
              </td>
              <td className="px-5 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rapid-bg text-rapid-text text-xs font-semibold">
                  {d.damageType
                    ? damageTypeMap[d.damageType] ?? d.damageType
                    : "—"}
                </span>
              </td>
              <td className="px-5 py-3 text-rapid-text-muted">
                {d.description || "—"}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums">
                {d.positionX != null ? Number(d.positionX) : "—"}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums">
                {d.positionY != null ? Number(d.positionY) : "—"}
              </td>
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
        <p className="text-sm text-rapid-text-muted">
          No hay fotos registradas para esta orden.
        </p>
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
            />
          </div>
          <div className="p-3">
            <p className="text-xs uppercase font-semibold text-rapid-green-dark">
              {p.photoType
                ? photoTypeMap[p.photoType] ?? p.photoType
                : "Foto"}
            </p>
            <p className="text-xs text-rapid-text-muted mt-1 truncate">
              {p.description || p.photoUrl}
            </p>
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
      <div className="px-5 py-2 bg-rapid-bg/30 border-b border-rapid-border">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
          {title}
        </p>
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
                {it.quantity != null
                  ? formatFractionQuantity(Number(it.quantity))
                  : "—"}
              </td>
              <td className="px-5 py-2 text-right tabular-nums">
                {formatMoney(Number(it.unitPrice ?? 0))}
              </td>
              <td className="px-5 py-2 text-right tabular-nums font-semibold">
                {formatMoney(Number(it.total ?? 0))}
              </td>
              <td className="px-5 py-2 text-rapid-text-muted">
                {it.assignedEmployee || "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-rapid-border bg-rapid-bg/20">
            <td
              colSpan={4}
              className="px-5 py-2 text-right text-xs font-semibold text-rapid-text-muted"
            >
              Subtotal {title.toLowerCase()}
            </td>
            <td className="px-5 py-2 text-right font-bold tabular-nums">
              {formatMoney(subtotal)}
            </td>
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
        <p className="text-sm text-rapid-text-muted mb-3">
          Aún no hay requisiciones de materiales para esta orden.
        </p>
        <Link
          href={`/material-requisitions/new?workOrderId=${order.id}`}
          className="btn-primary inline-flex"
        >
          <Plus className="w-4 h-4" /> Crear requisición
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={`/material-requisitions/new?workOrderId=${order.id}`}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Nueva requisición
        </Link>
      </div>
      {order.materialRequisitions.map((req) => {
        const { materialItems, paintItems } = splitRequisitionItems(req.items);
        return (
        <div key={req.id} className="card overflow-hidden">
          <div className="px-5 py-3 bg-rapid-bg/50 border-b border-rapid-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-mono text-xs font-semibold">
                Requisición #{String(req.id).padStart(5, "0")}
              </p>
              <p className="text-xs text-rapid-text-muted">
                {formatDateTime(req.createdAt)}
              </p>
            </div>
            <p className="font-bold text-rapid-green-dark text-lg">
              {formatMoney(Number(req.total ?? 0))}
            </p>
          </div>
          <RequisitionItemsTable title="Materiales" items={materialItems} />
          <RequisitionItemsTable title="Pintura" items={paintItems} />
        </div>
        );
      })}
    </div>
  );
}

function LaborTab({
  order,
  invoiceStatus,
}: {
  order: WorkOrder;
  invoiceStatus?: string | null;
}) {
  const laborEditable = canEditLaborOrder(invoiceStatus);
  if (order.laborOrders.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-rapid-text-muted mb-3">
          Aún no hay órdenes de mano de obra para esta orden.
        </p>
        <Link
          href={`/labor-orders/new?workOrderId=${order.id}`}
          className="btn-primary inline-flex"
        >
          <Plus className="w-4 h-4" /> Crear mano de obra
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={`/labor-orders/new?workOrderId=${order.id}`}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Nueva mano de obra
        </Link>
      </div>
      {order.laborOrders.map((lo) => (
        <div key={lo.id} className="card overflow-hidden">
          <div className="px-5 py-3 bg-rapid-bg/50 border-b border-rapid-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-mono text-xs font-semibold">
                MO-{String(lo.id).padStart(5, "0")}
              </p>
              <p className="text-sm font-medium mt-0.5">
                {laborOrderWorkerName(lo)}
              </p>
              <p className="text-xs text-rapid-text-muted">
                {formatDateTime(lo.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Link
                  href={`/labor-orders/${lo.id}`}
                  className="btn-secondary text-xs py-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver
                </Link>
                {laborEditable && (
                  <Link
                    href={`/labor-orders/${lo.id}/edit`}
                    className="btn-secondary text-xs py-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Link>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-rapid-green-dark text-lg tabular-nums">
                  {formatMoney(sumLaborOrderAmount(lo.items))}
                </p>
                <p className="text-xs text-rapid-text-muted">
                  {formatPieceCount(sumLaborOrderPieces(lo.items))} pzas.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-rapid-text-muted">
                <tr>
                  <th className="text-left font-semibold px-5 py-2">
                    Pieza o encuadre
                  </th>
                  <th className="text-right font-semibold px-5 py-2">
                    Cantidad
                  </th>
                  <th className="text-right font-semibold px-5 py-2">
                    Precio/pieza
                  </th>
                  <th className="text-right font-semibold px-5 py-2">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {lo.items.map((it) => (
                  <tr key={it.id} className="border-t border-rapid-border">
                    <td className="px-5 py-2 font-medium">{it.partName}</td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {formatPieceCount(laborItemQuantity(it))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {formatMoney(laborItemUnitPrice(it))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums font-semibold">
                      {formatMoney(laborItemLineAmount(it))}
                    </td>
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

type LatestInvoice = Awaited<
  ReturnType<typeof getLatestInvoiceForWorkOrder>
>;

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
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
              Facturación
            </p>
            <p className="text-lg font-bold mt-1">
              FAC-{String(latestInvoice.invoiceNumber).padStart(5, "0")}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <InvoiceStatusBadge status={latestInvoice.status} />
              <span className="text-sm text-rapid-text-muted">
                {formatDate(latestInvoice.invoiceDate)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/invoices/${latestInvoice.id}`}
              className="btn-primary"
            >
              Ver factura
            </Link>
            <Link
              href={`/print/invoices/${latestInvoice.id}`}
              target="_blank"
              className="btn-secondary"
            >
              Imprimir
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="card p-5">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
          Materiales
        </p>
        <p className="text-3xl font-bold mt-2">
          {formatMoney(financial.totalMaterials)}
        </p>
        <p className="text-xs text-rapid-text-muted mt-1.5">
          {order.materialRequisitions.length} requisición(es)
        </p>
      </div>
      <div className="card p-5">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
          Pintura
        </p>
        <p className="text-3xl font-bold mt-2">
          {formatMoney(financial.totalPaint)}
        </p>
        <p className="text-xs text-rapid-text-muted mt-1.5">
          Inventario separado
        </p>
      </div>
      <div className="card p-5">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
          Mano de obra
        </p>
        <p className="text-3xl font-bold mt-2">
          {formatMoney(financial.totalLaborAmount)}
        </p>
        <p className="text-xs text-rapid-text-muted mt-1.5">
          {formatPieceCount(financial.totalLaborPieces)} piezas ·{" "}
          {order.laborOrders.length} técnico(s)
        </p>
      </div>
      <div className="surface-dark p-5">
        <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
          Total interno
        </p>
        <p className="text-3xl font-bold mt-2 text-rapid-green">
          {formatMoney(financial.grandTotal)}
        </p>
        <p className="text-xs text-white/50 mt-1.5">
          Materiales + mano de obra (pagos a técnicos)
        </p>
      </div>
      </div>
    </div>
  );
}
