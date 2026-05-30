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
  | "windows";

export const CHECKLIST_ITEMS: Array<{ field: ChecklistField; label: string }> = [
  { field: "ac", label: "A/C" },
  { field: "carpets", label: "Alfombras" },
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
  { field: "windows", label: "Vidrios" },
];

export const CHECKLIST_LABEL_BY_FIELD: Record<ChecklistField, string> =
  Object.fromEntries(
    CHECKLIST_ITEMS.map((i) => [i.field, i.label]),
  ) as Record<ChecklistField, string>;

export const CHECKLIST_FIELD_BY_LABEL: Record<string, ChecklistField> =
  Object.fromEntries(CHECKLIST_ITEMS.map((i) => [i.label, i.field]));

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
