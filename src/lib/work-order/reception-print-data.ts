import { checklistDisplayItems, checklistRowsToDetails } from "@/lib/checklist";
import {
  DAMAGE_SIDES,
  DAMAGE_TYPES,
  FUEL_LEVELS,
  PHOTO_TYPES,
  WORK_ORDER_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/formatters/date";
import { formatMileage } from "@/lib/work-order/mileage";
import { VEHICLE_ZONE_MAP } from "@/lib/vehicle-zones";
import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import type { getWorkOrderForReceptionPrint } from "@/services/work-orders.service";

const fuelMap = Object.fromEntries(FUEL_LEVELS.map((f) => [f.value, f.label]));
const sideMap = Object.fromEntries(DAMAGE_SIDES.map((s) => [s.value, s.label]));
const damageTypeMap = Object.fromEntries(
  DAMAGE_TYPES.map((d) => [d.value, d.label]),
);
const photoTypeMap = Object.fromEntries(
  PHOTO_TYPES.map((p) => [p.value, p.label]),
);

function formatTime(value: Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatReceptionDateTime(
  date: Date | null | undefined,
  time: Date | null | undefined,
): string {
  if (!date) return "—";
  const base = formatDate(date);
  const t = formatTime(time);
  return t ? `${base} · ${t}` : base;
}

type WorkOrderForPrint = NonNullable<
  Awaited<ReturnType<typeof getWorkOrderForReceptionPrint>>
>;

export type ReceptionPrintData = {
  docTitle: string;
  docNumber: string;
  orderDate: string;
  statusLabel: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  brand: string | null;
  model: string | null;
  vehicleYear: number | null;
  color: string | null;
  plate: string | null;
  mileage: string | null;
  engine: string | null;
  quotationRef: string | null;
  deliveryDateTime: string;
  exitDateTime: string;
  fuelLevel: string;
  receivedBy: string | null;
  deliveredBy: string | null;
  customerReceivedSignature: string | null;
  requestedDamages: string | null;
  observations: string | null;
  checklist: {
    label: string;
    checked: boolean;
    comment: string | null;
  }[];
  checklistSummary: string;
  damages: {
    zone: number | null;
    zoneName: string | null;
    side: string;
    type: string;
    description: string;
    hasMarker: boolean;
  }[];
  photos: { url: string; label: string; description: string | null }[];
};

export function buildReceptionPrintData(
  order: WorkOrderForPrint,
  _workshop: WorkshopPrintInfo,
): ReceptionPrintData {
  const reception = order.receptions[0] ?? null;
  const { checked, comments, present } = checklistRowsToDetails(
    reception?.checklist,
  );

  const checklist = checklistDisplayItems(present).map((item) => ({
    label: item.label,
    checked: checked[item.field],
    comment: comments[item.field],
  }));

  const checkedCount = checklist.filter((c) => c.checked).length;
  const commentCount = checklist.filter((c) => c.comment).length;

  let quotationRef: string | null = null;
  if (order.quotation) {
    const prefix =
      order.quotation.quotationType === "INSURANCE" ? "PRE" : "COT";
    quotationRef = `${prefix}-${String(order.quotation.quotationNumber).padStart(5, "0")}`;
  }

  return {
    docTitle: "ORDEN DE RECEPCIÓN",
    docNumber: `ORD-${String(order.orderNumber).padStart(5, "0")}`,
    orderDate: formatDate(order.createdAt),
    statusLabel: WORK_ORDER_STATUS_LABELS[order.status] ?? order.status,
    customerName: order.customerName ?? "—",
    phone: order.phone,
    email: order.email,
    address: order.address,
    brand: order.brand,
    model: order.model,
    vehicleYear: order.vehicleYear,
    color: order.color,
    plate: order.plate,
    mileage: formatMileage(order.mileage, order.mileageUnit),
    engine: order.engine,
    quotationRef,
    deliveryDateTime: formatReceptionDateTime(
      reception?.deliveryDate,
      reception?.deliveryTime,
    ),
    exitDateTime: formatReceptionDateTime(
      reception?.exitDate,
      reception?.exitTime,
    ),
    fuelLevel: reception?.fuelLevel
      ? fuelMap[reception.fuelLevel] ?? reception.fuelLevel
      : "—",
    receivedBy: reception?.receivedBy ?? null,
    deliveredBy: reception?.deliveredBy ?? null,
    customerReceivedSignature: reception?.customerReceivedSignature ?? null,
    requestedDamages: reception?.requestedDamages ?? null,
    observations: reception?.observations ?? null,
    checklist,
    checklistSummary: `${checkedCount} de ${checklist.length} verificados${commentCount > 0 ? ` · ${commentCount} con comentario` : ""}`,
    damages: order.damages.map((d) => {
      const zone = d.zoneNumber ?? null;
      const zoneDef = zone != null ? VEHICLE_ZONE_MAP[zone] : null;
      return {
        zone,
        zoneName: zoneDef?.name ?? d.PartName ?? null,
        side: d.vehicleSide ? sideMap[d.vehicleSide] ?? d.vehicleSide : "—",
        type: d.damageType ? damageTypeMap[d.damageType] ?? d.damageType : "—",
        description: d.description ?? "—",
        hasMarker: zoneDef != null,
      };
    }),
    photos: order.photos.map((p) => ({
      url: p.photoUrl,
      label: p.photoType ? photoTypeMap[p.photoType] ?? p.photoType : "Foto",
      description: p.description,
    })),
  };
}
