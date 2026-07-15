import {
  buildDefaultChecklistFormValues,
  checklistRowsToDetails,
} from "@/lib/checklist";
import { CHECKLIST_ITEMS } from "@/lib/constants";
import { toDateInputValue, toTimeInputValue } from "@/lib/formatters/date";
import { getWorkshopTodayDateInput } from "@/lib/formatters/today";
import { toPlainNumber } from "@/lib/serialize";
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
    engine: "",
    deliveryDate: getWorkshopTodayDateInput(),
    deliveryTime: "08:00",
    exitDate: "",
    exitTime: "",
    fuelLevel: "HALF",
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
  const { checked, comments } = checklistRowsToDetails(reception?.checklist);
  const checklist = buildDefaultChecklistFormValues();

  for (const item of CHECKLIST_ITEMS) {
    checklist[item.field] = {
      checked: Boolean(checked[item.field]),
      comment: comments[item.field] ?? "",
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
    mileage: order.mileage ?? "",
    engine: order.engine ?? "",
    deliveryDate:
      toDateInputValue(reception?.deliveryDate) ||
      toDateInputValue(order.createdAt) ||
      toDateInputValue(new Date()),
    deliveryTime: toTimeInputValue(reception?.deliveryTime) || "08:00",
    exitDate: toDateInputValue(reception?.exitDate) || "",
    exitTime: toTimeInputValue(reception?.exitTime) || "",
    fuelLevel:
      (reception?.fuelLevel as WorkOrderFormValues["fuelLevel"]) ?? "HALF",
    requestedDamages: reception?.requestedDamages ?? "",
    observations: reception?.observations ?? "",
    receivedBy: reception?.receivedBy ?? "",
    customerReceivedSignature: reception?.customerReceivedSignature ?? "",
    notes: order.notes ?? "",
    checklist,
    damages: order.damages.map((d) => ({
      vehicleSide: (d.vehicleSide ?? "FRONT") as
        | "FRONT"
        | "BACK"
        | "LEFT"
        | "RIGHT"
        | "TOP",
      damageType: (d.damageType ?? "OTHER") as
        | "SCRATCH"
        | "DENT"
        | "PAINT_DAMAGE"
        | "BROKEN"
        | "OTHER",
      description: d.description ?? "",
      positionX: toPlainNumber(d.positionX) ?? undefined,
      positionY: toPlainNumber(d.positionY) ?? undefined,
    })),
    photos: order.photos.map((p) => ({
      photoUrl: p.photoUrl,
      photoType: normalizePhotoType(p.photoType),
      description: p.description ?? "",
    })),
  };
}
