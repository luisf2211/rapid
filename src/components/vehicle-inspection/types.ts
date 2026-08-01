import type { VehicleView } from "./VehicleSilhouettes";

/**
 * Tipos de herramientas de anotación disponibles en el diagrama de inspección.
 */
export type AnnotationTool =
  | "crossMark"    // X — golpe
  | "circle"       // Círculo — abolladura
  | "scratch"      // Línea ondulada — rayón
  | "arrow"        // Flecha — indicador direccional
  | "crack"        // Estrella/grieta — rotura
  | "text"         // Texto libre
  | "eraser";      // Borrador

export const ANNOTATION_TOOLS: {
  tool: AnnotationTool;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  { tool: "crossMark", label: "Golpe", shortLabel: "X", description: "Marca X para golpes" },
  { tool: "circle", label: "Abolladura", shortLabel: "O", description: "Círculo para abolladuras" },
  { tool: "scratch", label: "Rayón", shortLabel: "~", description: "Línea para rayones" },
  { tool: "arrow", label: "Flecha", shortLabel: "→", description: "Flecha indicadora" },
  { tool: "crack", label: "Rotura", shortLabel: "✱", description: "Marca de rotura/grieta" },
  { tool: "text", label: "Texto", shortLabel: "T", description: "Texto libre" },
  { tool: "eraser", label: "Borrar", shortLabel: "⌫", description: "Eliminar anotación" },
];

/**
 * Una anotación colocada sobre una vista del vehículo.
 * Las coordenadas (x, y) son porcentajes (0-100) relativos al viewBox de la vista.
 */
export interface VehicleAnnotation {
  /** ID único de la anotación */
  id: string;
  /** Vista donde se colocó */
  view: VehicleView;
  /** Tipo de herramienta usada */
  tool: Exclude<AnnotationTool, "eraser">;
  /** Posición X como porcentaje del ancho del viewBox (0-100) */
  x: number;
  /** Posición Y como porcentaje del alto del viewBox (0-100) */
  y: number;
  /** Punto final para flechas y rayones (porcentaje) */
  x2?: number;
  y2?: number;
  /** Texto de la anotación (para tool "text") */
  text?: string;
  /** Descripción opcional del daño */
  description?: string;
  /** Número secuencial para referencia en la tabla */
  number: number;
}

/** Estado completo del diagrama de inspección */
export interface InspectionDiagramState {
  annotations: VehicleAnnotation[];
}

/** Genera un ID único para una anotación */
export function generateAnnotationId(): string {
  return `ann_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
