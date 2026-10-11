/**
 * Catálogo de inspección de daños del vehículo.
 *
 * Valores estructurados (no enums sueltos) pensados para migrarse a tablas
 * de catálogo por empresa en el futuro sin romper datos: los `id` que se
 * guardan en BD son strings estables.
 */

// Vista del vehículo (coincide con los nombres de los PNG en /public/reception).
export type VehicleView = "left" | "right" | "front" | "rear" | "top";

// ─── Tipos de daño ───────────────────────────────────────────────────────────
export type DamageTypeId = "GOLPE" | "ABOLLADURA" | "RAYON" | "ROTURA" | "PINTURA";

export type DamageTypeDef = {
  id: DamageTypeId;
  label: string;
  /** Letra visible en el marcador y la leyenda (legible en B/N). */
  letter: string;
  /** Color de acento para la UI (no se depende de él para el PDF). */
  color: string;
};

export const DAMAGE_TYPES: DamageTypeDef[] = [
  { id: "GOLPE", label: "Golpe / Impacto", letter: "G", color: "#dc2626" },
  { id: "ABOLLADURA", label: "Abolladura", letter: "A", color: "#d97706" },
  { id: "RAYON", label: "Rayón", letter: "R", color: "#2563eb" },
  { id: "ROTURA", label: "Rotura / Quebrado", letter: "Q", color: "#7c3aed" },
  { id: "PINTURA", label: "Pintura dañada", letter: "P", color: "#059669" },
];

export const DAMAGE_TYPE_BY_ID: Record<string, DamageTypeDef> = Object.fromEntries(
  DAMAGE_TYPES.map((d) => [d.id, d]),
);

export function damageTypeLabel(id: string | null | undefined): string {
  if (!id) return "—";
  return DAMAGE_TYPE_BY_ID[id]?.label ?? id;
}

export function damageTypeLetter(id: string | null | undefined): string {
  if (!id) return "•";
  return DAMAGE_TYPE_BY_ID[id]?.letter ?? "•";
}

// ─── Severidad ───────────────────────────────────────────────────────────────
export type SeverityId = "LEVE" | "MODERADO" | "SEVERO";

export type SeverityDef = { id: SeverityId; label: string };

export const SEVERITIES: SeverityDef[] = [
  { id: "LEVE", label: "Leve" },
  { id: "MODERADO", label: "Moderado" },
  { id: "SEVERO", label: "Severo" },
];

export function severityLabel(id: string | null | undefined): string {
  if (!id) return "—";
  return SEVERITIES.find((s) => s.id === id)?.label ?? id;
}

// ─── Vistas del vehículo ──────────────────────────────────────────────────────
export const VEHICLE_VIEWS: { id: VehicleView; label: string }[] = [
  { id: "left", label: "Izquierda" },
  { id: "right", label: "Derecha" },
  { id: "front", label: "Frente" },
  { id: "rear", label: "Atrás" },
  { id: "top", label: "Superior" },
];

// ─── Piezas del vehículo (catálogo plano) ─────────────────────────────────────
// El usuario elige la pieza manualmente tras tocar. Ids estables para persistir.
// Parametrizable: ampliar aquí sin tocar la UI. Diseñado para que una futura
// detección automática pueda rellenar vehiclePartId sin cambiar el modelo.
export type VehiclePart = { id: string; label: string };

export const VEHICLE_PARTS: VehiclePart[] = [
  { id: "front_bumper", label: "Bumper delantero" },
  { id: "hood", label: "Capó / Bonete" },
  { id: "front_fender_l", label: "Guardalodo del. izq." },
  { id: "front_fender_r", label: "Guardalodo del. der." },
  { id: "front_door_l", label: "Puerta del. izq." },
  { id: "front_door_r", label: "Puerta del. der." },
  { id: "rear_door_l", label: "Puerta tras. izq." },
  { id: "rear_door_r", label: "Puerta tras. der." },
  { id: "rocker_l", label: "Faldón izquierdo" },
  { id: "rocker_r", label: "Faldón derecho" },
  { id: "quarter_l", label: "Cuarto trasero izq." },
  { id: "quarter_r", label: "Cuarto trasero der." },
  { id: "roof", label: "Techo" },
  { id: "trunk", label: "Baúl" },
  { id: "rear_bumper", label: "Bumper trasero" },
  { id: "other", label: "Otro" },
];

export function partLabelById(id: string | null | undefined): string {
  if (!id) return "—";
  const found = VEHICLE_PARTS.find((p) => p.id === id);
  return found?.label ?? id;
}
