export const WORK_ORDER_STATUS = {
  RECEIVED: "RECEIVED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const WORK_ORDER_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Recibida",
  IN_PROGRESS: "En proceso",
  COMPLETED: "Completada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

export const FUEL_LEVELS = [
  { value: "EMPTY", label: "Vacío" },
  { value: "QUARTER", label: "1/4" },
  { value: "HALF", label: "1/2" },
  { value: "THREE_QUARTERS", label: "3/4" },
  { value: "FULL", label: "Lleno" },
] as const;

export const DAMAGE_SIDES = [
  { value: "FRONT", label: "Frente" },
  { value: "BACK", label: "Atrás" },
  { value: "LEFT", label: "Izquierda" },
  { value: "RIGHT", label: "Derecha" },
  { value: "TOP", label: "Techo" },
] as const;

export const DAMAGE_TYPES = [
  { value: "SCRATCH", label: "Rayón" },
  { value: "DENT", label: "Abolladura" },
  { value: "PAINT_DAMAGE", label: "Daño de pintura" },
  { value: "BROKEN", label: "Roto" },
  { value: "OTHER", label: "Otro" },
] as const;

export const PHOTO_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "RECEPTION", label: "Recepción" },
  { value: "FRONT", label: "Frente" },
  { value: "BACK", label: "Atrás" },
  { value: "LEFT", label: "Izquierda" },
  { value: "RIGHT", label: "Derecha" },
  { value: "DAMAGE", label: "Daño" },
  { value: "BEFORE", label: "Antes" },
  { value: "AFTER", label: "Después" },
  { value: "DOCUMENT", label: "Documento" },
] as const;

export type ChecklistField =
  | "ac"
  | "carpets"
  | "carpetsFabric"
  | "carpetsRubber"
  | "seats"
  | "speakers"
  | "seatBelts"
  | "radio"
  | "documents"
  | "rearViewMirror"
  | "alarm"
  | "checkEngine"
  | "abs"
  | "airbag"
  | "brake"
  | "tireLight"
  | "stabilityLight"
  | "jack"
  | "spareTire"
  | "logos"
  | "wheelKeys"
  | "keychains"
  | "lenses"
  | "speakerCovers"
  | "gasCap"
  | "antennas"
  | "batteries"
  | "windows"
  | "radar"
  | "parkingSensors"
  | "rearCamera"
  | "engineCover";

/**
 * Ítems retirados del checklist: ya no se ofrecen al crear una recepción, pero
 * se siguen mostrando y conservando en las órdenes que los tienen guardados.
 */
export type LegacyChecklistField = "carpets" | "carpetsFabric" | "carpetsRubber";

export type ActiveChecklistField = Exclude<ChecklistField, LegacyChecklistField>;

export const CHECKLIST_ITEMS: Array<{
  field: ActiveChecklistField;
  label: string;
}> = [
  { field: "ac", label: "A/C" },
  { field: "seats", label: "Asientos" },
  { field: "speakers", label: "Bocinas" },
  { field: "seatBelts", label: "Cinturones" },
  { field: "radio", label: "Radio" },
  { field: "documents", label: "Documentos" },
  { field: "rearViewMirror", label: "Retrovisor" },
  { field: "alarm", label: "Alarma" },
  { field: "checkEngine", label: "Check Engine" },
  { field: "abs", label: "ABS" },
  { field: "airbag", label: "Airbag" },
  { field: "brake", label: "Brake" },
  { field: "tireLight", label: "Luz de llantas" },
  { field: "stabilityLight", label: "Luz de estabilidad" },
  { field: "jack", label: "Gato" },
  { field: "spareTire", label: "Goma de repuesto" },
  { field: "logos", label: "Logos" },
  { field: "wheelKeys", label: "Llaves de rueda" },
  { field: "keychains", label: "Llaveros" },
  { field: "lenses", label: "Micas" },
  { field: "speakerCovers", label: "Tapa de bocinas" },
  { field: "gasCap", label: "Tapa de gasolina" },
  { field: "antennas", label: "Antenas" },
  { field: "batteries", label: "Baterías" },
  { field: "engineCover", label: "Cover del motor" },
  { field: "windows", label: "Vidrios" },
  { field: "radar", label: "Radar" },
  { field: "parkingSensors", label: "Sensores de parqueo" },
  { field: "rearCamera", label: "Cámara trasera" },
];

export const LEGACY_CHECKLIST_ITEMS: Array<{
  field: LegacyChecklistField;
  label: string;
}> = [
  { field: "carpets", label: "Alfombras" },
  { field: "carpetsFabric", label: "Alfombras (Tela)" },
  { field: "carpetsRubber", label: "Alfombras (Goma)" },
];

/** Catálogo completo: lo vigente más lo retirado, para leer órdenes históricas. */
export const ALL_CHECKLIST_ITEMS: Array<{
  field: ChecklistField;
  label: string;
}> = [...CHECKLIST_ITEMS, ...LEGACY_CHECKLIST_ITEMS];

const LEGACY_CHECKLIST_FIELDS = new Set<string>(
  LEGACY_CHECKLIST_ITEMS.map((i) => i.field),
);

export function isLegacyChecklistField(
  field: ChecklistField,
): field is LegacyChecklistField {
  return LEGACY_CHECKLIST_FIELDS.has(field);
}

export const CHECKLIST_LABEL_BY_FIELD: Record<ChecklistField, string> =
  Object.fromEntries(
    ALL_CHECKLIST_ITEMS.map((i) => [i.field, i.label]),
  ) as Record<ChecklistField, string>;

export const CHECKLIST_FIELD_BY_LABEL: Record<string, ChecklistField> =
  Object.fromEntries(ALL_CHECKLIST_ITEMS.map((i) => [i.label, i.field]));

export const SUGGESTED_MATERIALS = [
  "Sistema",
  "Lija",
  "Masilla",
  "Relleno",
  "Pintura base",
  "Pintura original",
  "Clear",
  "Activador",
  "Esmeril",
  "Perfect",
  "Cera",
];

export const INVENTORY_UNITS = [
  { value: "PZ", label: "Pieza" },
  { value: "GL", label: "Galón" },
  { value: "LT", label: "Litro" },
  { value: "KG", label: "Kilogramo" },
  { value: "ML", label: "Mililitro" },
  { value: "SET", label: "Juego" },
] as const;

/** Categorías que usan galón por defecto al registrar inventario. */
export const INVENTORY_GALLON_CATEGORIES = ["Pintura", "Consumibles"] as const;

export const INVENTORY_PART_TYPES = {
  MATERIAL: "MATERIAL",
  PAINT: "PAINT",
} as const;

export type InventoryPartType =
  (typeof INVENTORY_PART_TYPES)[keyof typeof INVENTORY_PART_TYPES];

export const INVENTORY_PART_TYPE_LABELS: Record<InventoryPartType, string> = {
  MATERIAL: "Material",
  PAINT: "Pintura",
};

export const MATERIAL_REQUISITION_LINE_TYPES = {
  MATERIAL: "MATERIAL",
  PAINT: "PAINT",
} as const;

export const INVENTORY_CATEGORIES = [
  "Carrocería",
  "Pintura",
  "Consumibles",
  "Herramienta",
  "Refacción",
  "Otro",
] as const;

export const INVENTORY_MOVEMENT_TYPES = {
  IN: "IN",
  OUT: "OUT",
  ADJUST: "ADJUST",
} as const;

export const INVENTORY_MOVEMENT_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUST: "Ajuste",
};

export const INVENTORY_MOVEMENT_REASONS = [
  { value: "PURCHASE", label: "Compra" },
  { value: "WORK_ORDER", label: "Orden de trabajo" },
  { value: "ADJUSTMENT", label: "Ajuste de inventario" },
  { value: "RETURN", label: "Devolución" },
  { value: "DAMAGE", label: "Merma / daño" },
  { value: "OTHER", label: "Otro" },
] as const;

export const QUOTATION_TYPES = [
  { value: "PRIVATE", label: "Particular" },
  { value: "INSURANCE", label: "Aseguradora" },
] as const;

export const QUOTATION_STATUSES = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CONVERTED: "CONVERTED",
} as const;

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CONVERTED: "Convertida",
};

export const QUOTATION_PHOTO_CATEGORIES = [
  { value: "INSPECTION", label: "Inspección / daño" },
  { value: "BEFORE", label: "Antes" },
  { value: "DURING", label: "Durante trabajo" },
  { value: "AFTER", label: "Después" },
] as const;

export const QUOTATION_PHOTO_CATEGORY_LABELS: Record<string, string> =
  Object.fromEntries(
    QUOTATION_PHOTO_CATEGORIES.map((c) => [c.value, c.label]),
  );

/** Tareas de mano de obra en cotización (solo monto totalizado, sin horas). */
export const QUOTATION_LABOR_AREAS = [
  { value: "REPAIR_PAINT", label: "Reparar y pintar" },
  { value: "CHANGE_PAINT", label: "Cambiar y pintar" },
  { value: "SAVE_PAINT", label: "Salvar y pintar" },
  { value: "BRILLO", label: "Brillo" },
] as const;

/** Valores antiguos (cotizaciones ya guardadas). */
export const QUOTATION_LABOR_AREAS_LEGACY: Record<string, string> = {
  DESAB: "Desabollado",
  PREP: "Preparación",
  PAINT: "Pintura",
  POLISH: "Pulido",
  ASSEMBLY: "Armado",
};

export const QUOTATION_LABOR_AREA_VALUES = [
  ...QUOTATION_LABOR_AREAS.map((a) => a.value),
  ...Object.keys(QUOTATION_LABOR_AREAS_LEGACY),
] as [string, ...string[]];

export function quotationLaborAreaLabel(value: string): string {
  const match = QUOTATION_LABOR_AREAS.find((a) => a.value === value);
  if (match) return match.label;
  return QUOTATION_LABOR_AREAS_LEGACY[value] ?? value;
}

/** Opciones del select; incluye valor legacy si la línea ya lo tenía. */
export function quotationLaborAreaOptions(currentValue?: string) {
  const options: { value: string; label: string }[] = [
    ...QUOTATION_LABOR_AREAS,
  ];
  if (currentValue && !options.some((o) => o.value === currentValue)) {
    options.push({
      value: currentValue,
      label: quotationLaborAreaLabel(currentValue),
    });
  }
  return options;
}

export const INVOICE_STATUSES = {
  PENDING: "PENDING",
  INVOICED: "INVOICED",
  PAID: "PAID",
  VOID: "VOID",
} as const;

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  INVOICED: "Facturada",
  PAID: "Pagada",
  VOID: "Anulada",
};

export const INVOICE_LINE_TYPES = {
  LABOR: "LABOR",
  MATERIAL: "MATERIAL",
  PART: "PART",
  OTHER: "OTHER",
} as const;

export const INVOICE_LINE_TYPE_LABELS: Record<string, string> = {
  LABOR: "Mano de obra",
  MATERIAL: "Material",
  PART: "Repuesto",
  OTHER: "Otro",
};

/** Roles / técnicos frecuentes en mano de obra (producción por pieza). */
export const LABOR_TECHNICIAN_ROLES = [
  "Desabollador",
  "Preparador",
  "Pintor",
  "Brillo",
  "Desarmador",
  "Externo",
] as const;

export const EMPLOYEE_PAYMENT_TYPES = {
  ADVANCE: "ADVANCE",
  PAYROLL: "PAYROLL",
} as const;

export const EMPLOYEE_PAYMENT_TYPE_LABELS: Record<string, string> = {
  ADVANCE: "Anticipo",
  PAYROLL: "Pago quincenal",
};

export const PAYROLL_PERIOD_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  PAID: "PAID",
} as const;

export const PAYROLL_PERIOD_STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierto",
  CLOSED: "Cerrado",
  PAID: "Pagado",
};

export const PAYROLL_SETTLEMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
};

export const PAYMENT_METHODS = [
  "EFECTIVO",
  "TRANSFERENCIA",
  "CHEQUE",
] as const;

export const SUGGESTED_PARTS = [
  "Bomper delantero",
  "Bomper trasero",
  "Guarda lodo derecho delantero",
  "Guarda lodo izquierdo delantero",
  "Guarda lodo derecho trasero",
  "Guarda lodo izquierdo trasero",
  "Puerta derecha delantera",
  "Puerta izquierda delantera",
  "Puerta derecha trasera",
  "Puerta izquierda trasera",
  "Bonete",
  "Baúl",
  "Capota",
  "Otros servicios",
];
