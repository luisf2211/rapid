/**
 * Catálogo de inspección de daños del vehículo.
 *
 * Valores estructurados (no enums sueltos) pensados para migrarse a tablas
 * de catálogo por empresa en el futuro sin romper datos: los `id` que se
 * guardan en BD son strings estables.
 */

import type { VehicleView } from "@/components/vehicle-inspection/VehicleSilhouettes";

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
  { id: "left", label: "Lateral izq." },
  { id: "right", label: "Lateral der." },
  { id: "front", label: "Frontal" },
  { id: "back", label: "Trasera" },
  { id: "top", label: "Superior" },
];

// ─── Piezas / regiones del vehículo ───────────────────────────────────────────
// Regiones rectangulares normalizadas (x,y,w,h en 0–100 del viewBox de la vista).
// Permiten autodetectar la pieza al tocar. Son parametrizables: ampliar o ajustar
// aquí sin tocar la UI. El `id` es estable para persistirse.
export type VehiclePart = {
  id: string;
  label: string;
  /** Región aproximada [x, y, w, h] en % para autodetección por toque. */
  region: [number, number, number, number];
};

export const VEHICLE_PARTS_BY_VIEW: Record<VehicleView, VehiclePart[]> = {
  left: [
    { id: "front_bumper_l", label: "Bumper delantero", region: [0, 35, 15, 45] },
    { id: "front_fender_l", label: "Guardalodo del. izq.", region: [15, 30, 15, 50] },
    { id: "front_door_l", label: "Puerta del. izq.", region: [30, 25, 20, 55] },
    { id: "rear_door_l", label: "Puerta tras. izq.", region: [50, 25, 20, 55] },
    { id: "rear_fender_l", label: "Guardalodo tras. izq.", region: [70, 30, 15, 50] },
    { id: "rear_bumper_l", label: "Bumper trasero", region: [85, 35, 15, 45] },
    { id: "roof_l", label: "Techo", region: [28, 5, 44, 20] },
  ],
  right: [
    { id: "rear_bumper_r", label: "Bumper trasero", region: [0, 35, 15, 45] },
    { id: "rear_fender_r", label: "Guardalodo tras. der.", region: [15, 30, 15, 50] },
    { id: "rear_door_r", label: "Puerta tras. der.", region: [30, 25, 20, 55] },
    { id: "front_door_r", label: "Puerta del. der.", region: [50, 25, 20, 55] },
    { id: "front_fender_r", label: "Guardalodo del. der.", region: [70, 30, 15, 50] },
    { id: "front_bumper_r", label: "Bumper delantero", region: [85, 35, 15, 45] },
    { id: "roof_r", label: "Techo", region: [28, 5, 44, 20] },
  ],
  front: [
    { id: "hood", label: "Bonete / Capó", region: [20, 10, 60, 30] },
    { id: "front_bumper", label: "Bumper delantero", region: [15, 60, 70, 30] },
    { id: "windshield", label: "Parabrisas", region: [25, 40, 50, 20] },
    { id: "headlight_l", label: "Faro izquierdo", region: [8, 45, 15, 20] },
    { id: "headlight_r", label: "Faro derecho", region: [77, 45, 15, 20] },
  ],
  back: [
    { id: "trunk", label: "Baúl / Tapa trasera", region: [20, 15, 60, 30] },
    { id: "rear_bumper", label: "Bumper trasero", region: [15, 60, 70, 30] },
    { id: "rear_glass", label: "Cristal trasero", region: [25, 40, 50, 20] },
    { id: "taillight_l", label: "Stop izquierdo", region: [8, 45, 15, 20] },
    { id: "taillight_r", label: "Stop derecho", region: [77, 45, 15, 20] },
  ],
  top: [
    { id: "hood_top", label: "Bonete", region: [25, 5, 50, 22] },
    { id: "roof_top", label: "Techo", region: [25, 30, 50, 40] },
    { id: "trunk_top", label: "Baúl", region: [25, 73, 50, 22] },
  ],
};

/** Autodetecta la pieza tocada en una vista a partir de coords normalizadas. */
export function detectPart(
  view: VehicleView,
  x: number,
  y: number,
): VehiclePart | null {
  const parts = VEHICLE_PARTS_BY_VIEW[view] ?? [];
  for (const p of parts) {
    const [rx, ry, rw, rh] = p.region;
    if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) return p;
  }
  // Si no cae en ninguna región, devuelve la primera como fallback editable.
  return parts[0] ?? null;
}

export function allPartsFlat(): VehiclePart[] {
  return Object.values(VEHICLE_PARTS_BY_VIEW).flat();
}

export function partLabelById(id: string | null | undefined): string {
  if (!id) return "—";
  const found = allPartsFlat().find((p) => p.id === id);
  return found?.label ?? id;
}
