import {
  buildDefaultChecklistFormValues,
  checklistRowsToDetails,
  legacyChecklistFieldsPresent,
} from "@/lib/checklist";
import { CHECKLIST_ITEMS } from "@/lib/constants";
import { toDateInputValue, toTimeInputValue } from "@/lib/formatters/date";
import { getWorkshopTodayDateInput } from "@/lib/formatters/today";
import { toPlainNumber } from "@/lib/serialize";
import { parseMileage } from "@/lib/work-order/mileage";
import type { PhotoInput, WorkOrderFormValues } from "@/lib/validations/work-order";
import type { getWorkOrderById } from "@/services/work-orders.service";

export type WorkOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getWorkOrderById>>
>;

const PHOTO_TYPES = new Set<PhotoInput["photoType"]>([
  "GENERAL",
  "RECEPTION",
  "FRONT",
  "BACK",
  "LEFT",
  "RIGHT",
  "DAMAGE",
  "BEFORE",
  "AFTER",
  "DOCUMENT",
]);

function normalizePhotoType(value: string | null | undefined): PhotoInput["photoType"] {
  if (value && PHOTO_TYPES.has(value as PhotoInput["photoType"])) {
    return value as PhotoInput["photoType"];
  }
  return "RECEPTION";
}

type DamageView = "front" | "back" | "left" | "right" | "top";
type DamageTypeId = "GOLPE" | "ABOLLADURA" | "RAYON" | "ROTURA" | "PINTURA";
type SeverityId = "LEVE" | "MODERADO" | "SEVERO";

/** Normaliza la vista guardada (uppercase o lowercase) al id del diagrama. */
function normalizeView(value: string | null | undefined): DamageView {
  const v = (value ?? "").toLowerCase();
  if (v === "front" || v === "back" || v === "left" || v === "right" || v === "top") {
    return v;
  }
  return "left";
}

/** Traduce el tipo de daño (nuevo id o enum legacy) al catálogo actual. */
function normalizeDamageTypeId(value: string | null | undefined): DamageTypeId {
  const v = (value ?? "").toUpperCase();
  // Ids nuevos
  if (v === "GOLPE" || v === "ABOLLADURA" || v === "RAYON" || v === "ROTURA" || v === "PINTURA") {
    return v as DamageTypeId;
  }
  // Enums legacy
  switch (v) {
    case "SCRATCH":
      return "RAYON";
    case "DENT":
      return "ABOLLADURA";
    case "BROKEN":
      return "ROTURA";
    case "PAINT_DAMAGE":
      return "PINTURA";
    default:
      return "GOLPE";
  }
}

function normalizeSeverity(value: string | null | undefined): SeverityId {
  const v = (value ?? "").toUpperCase();
  if (v === "LEVE" || v === "MODERADO" || v === "SEVERO") return v as SeverityId;
  return "LEVE";
}

export function makeDefaultWorkOrderFormValues(): WorkOrderFormValues {
  return {
    customerName: "",
    phone: "",
    email: "",
    address: "",
    brand: "",
    model: "",
    vehicleYear: new Date().getFullYear(),
    color: "",
    plate: "",
    mileage: "",
    mileageUnit: "mi",
    engine: "",
    deliveryDate: getWorkshopTodayDateInput(),
    deliveryTime: "08:00",
    exitDate: "",
    exitTime: "",
    fuelLevel: 50,
    requestedDamages: "",
    observations: "",
    receivedBy: "",
    customerReceivedSignature: "",
    notes: "",
    checklist: buildDefaultChecklistFormValues(),
    damages: [],
    photos: [],
  };
}

export function workOrderToFormValues(order: WorkOrderDetail): WorkOrderFormValues {
  const reception = order.receptions[0];
  const { checked, comments, present } = checklistRowsToDetails(
    reception?.checklist,
  );
  const checklist = buildDefaultChecklistFormValues();
  const mileage = parseMileage(order.mileage, order.mileageUnit);

  for (const item of CHECKLIST_ITEMS) {
    checklist[item.field] = {
      checked: Boolean(checked[item.field]),
      comment: comments[item.field] ?? "",
    };
  }

  // Los ítems retirados solo entran al formulario si esta orden ya los tenía,
  // así al guardar se recrean en vez de perderse.
  for (const field of legacyChecklistFieldsPresent(present)) {
    checklist[field] = {
      checked: Boolean(checked[field]),
      comment: comments[field] ?? "",
    };
  }

  return {
    customerName: order.customerName ?? "",
    phone: order.phone ?? "",
    email: order.email ?? "",
    address: order.address ?? "",
    brand: order.brand ?? "",
    model: order.model ?? "",
    vehicleYear: order.vehicleYear ?? new Date().getFullYear(),
    color: order.color ?? "",
    plate: order.plate ?? "",
    mileage: mileage.value,
    mileageUnit: mileage.unit ?? "mi",
    engine: order.engine ?? "",
    deliveryDate:
      toDateInputValue(reception?.deliveryDate) ||
      toDateInputValue(order.createdAt) ||
      toDateInputValue(new Date()),
    deliveryTime: toTimeInputValue(reception?.deliveryTime) || "08:00",
    exitDate: toDateInputValue(reception?.exitDate) || "",
    exitTime: toTimeInputValue(reception?.exitTime) || "",
    fuelLevel: reception?.fuelLevel ?? 50,
    requestedDamages: reception?.requestedDamages ?? "",
    observations: reception?.observations ?? "",
    receivedBy: reception?.receivedBy ?? "",
    customerReceivedSignature: reception?.customerReceivedSignature ?? "",
    notes: order.notes ?? "",
    checklist,
    damages: order.damages.map((d) => ({
      view: normalizeView(d.vehicleSide),
      x: toPlainNumber(d.positionX) ?? 50,
      y: toPlainNumber(d.positionY) ?? 50,
      damageTypeId: normalizeDamageTypeId(d.damageType),
      severity: normalizeSeverity(d.severity),
      vehiclePartId: d.vehiclePartId ?? "",
      partName: d.PartName ?? "",
      observations: d.description ?? "",
      photos: (d.photos ?? []).map((p) => p.photoUrl),
    })),
    photos: order.photos.map((p) => ({
      photoUrl: p.photoUrl,
      photoType: normalizePhotoType(p.photoType),
      description: p.description ?? "",
    })),
  };
}
