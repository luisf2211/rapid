import type { VehicleView } from "@/lib/vehicle-damage/catalog";

/**
 * Fuente única de verdad: mapeo vista → PNG del vehículo.
 * Mismos assets para la app (captura) y el documento impreso.
 */
export const VEHICLE_IMAGES: Record<VehicleView, string> = {
  left: "/reception/left.png",
  right: "/reception/right.png",
  front: "/reception/front.png",
  rear: "/reception/rear.png",
  top: "/reception/top.png",
};

/**
 * Relación de aspecto (ancho/alto) de cada PNG, para reservar el espacio
 * exacto del contenedor y que el overlay calce sin desplazamiento.
 */
export const VEHICLE_IMAGE_RATIO: Record<VehicleView, number> = {
  left: 2172 / 724,
  right: 2172 / 724,
  front: 1536 / 1024,
  rear: 1536 / 1024,
  top: 1536 / 1024,
};

/** Convierte una coordenada normalizada (0–1) a porcentaje para CSS. */
export function toPercent(normalized: number): string {
  return `${(normalized * 100).toFixed(4)}%`;
}
