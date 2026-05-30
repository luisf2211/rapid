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
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  getWorkOrderById,
  getWorkOrderFinancialSummary,
} from "@/services/work-orders.service";
import { checklistRowsToDetails } from "@/lib/checklist";
import { formatMoney } from "@/lib/formatters/money";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
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
  const reception = order.receptions[0] ?? null;

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
          </>
        }
      />

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

        <div className="card p-5 bg-gradient-to-br from-rapid-black to-[#1a201e] text-white border-rapid-black">
          <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
            Total general
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
              <span>Mano de obra</span>
              <span className="font-mono text-white">
                {formatMoney(financial.totalLabor)}
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
            content: <ReceptionTab order={order} reception={reception} />,
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
            content: <LaborTab order={order} />,
          },
          {
            id: "summary",
            label: "Resumen financiero",
            content: <FinancialTab order={order} financial={financial} />,
          },
        ]}
      />
    </>
  );
}

type WorkOrder = NonNullable<Awaited<ReturnType<typeof getWorkOrderById>>>;
type Reception = WorkOrder["receptions"][number];
type Financial = Awaited<ReturnType<typeof getWorkOrderFinancialSummary>>;

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
}: {
  order: WorkOrder;
  reception: Reception | null;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      {order.materialRequisitions.map((req) => (
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
              {req.items.map((it) => (
                <tr key={it.id} className="border-t border-rapid-border">
                  <td className="px-5 py-2 font-medium">{it.productName}</td>
                  <td className="px-5 py-2 text-right tabular-nums">
                    {it.quantity != null ? Number(it.quantity) : "—"}
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
          </table>
        </div>
      ))}
    </div>
  );
}

function LaborTab({ order }: { order: WorkOrder }) {
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
                Mano de obra #{String(lo.id).padStart(5, "0")}
              </p>
              <p className="text-xs text-rapid-text-muted">
                {formatDateTime(lo.createdAt)}
              </p>
            </div>
            <p className="font-bold text-rapid-green-dark text-lg">
              {formatMoney(Number(lo.total ?? 0))}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-rapid-text-muted">
                <tr>
                  <th className="text-left font-semibold px-5 py-2">Pieza</th>
                  <th className="text-right font-semibold px-5 py-2">
                    Desabolladura
                  </th>
                  <th className="text-right font-semibold px-5 py-2">
                    Desarme
                  </th>
                  <th className="text-right font-semibold px-5 py-2">Prep.</th>
                  <th className="text-right font-semibold px-5 py-2">Pintura</th>
                  <th className="text-right font-semibold px-5 py-2">Pulido</th>
                  <th className="text-right font-semibold px-5 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {lo.items.map((it) => (
                  <tr key={it.id} className="border-t border-rapid-border">
                    <td className="px-5 py-2 font-medium">{it.partName}</td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {formatMoney(Number(it.desabCost ?? 0))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {formatMoney(Number(it.disassemblerCost ?? 0))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {formatMoney(Number(it.prepCost ?? 0))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {formatMoney(Number(it.painterCost ?? 0))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {formatMoney(Number(it.polisherCost ?? 0))}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums font-semibold">
                      {formatMoney(Number(it.total ?? 0))}
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

function FinancialTab({
  order,
  financial,
}: {
  order: WorkOrder;
  financial: Financial;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card p-5">
        <p className="text-xs uppercase tracking-wider font-semibold text-rapid-text-muted">
          Total materiales
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
          Total mano de obra
        </p>
        <p className="text-3xl font-bold mt-2">
          {formatMoney(financial.totalLabor)}
        </p>
        <p className="text-xs text-rapid-text-muted mt-1.5">
          {order.laborOrders.length} orden(es) de mano de obra
        </p>
      </div>
      <div className="card p-5 bg-gradient-to-br from-rapid-black to-[#1a201e] text-white border-rapid-black">
        <p className="text-xs uppercase tracking-wider font-semibold text-white/60">
          Total general
        </p>
        <p className="text-3xl font-bold mt-2 text-rapid-green">
          {formatMoney(financial.grandTotal)}
        </p>
        <p className="text-xs text-white/50 mt-1.5">
          Materiales + Mano de obra
        </p>
      </div>
    </div>
  );
}
