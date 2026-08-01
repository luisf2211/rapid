/**
 * Siluetas SVG de vehículo para el diagrama de inspección.
 * Estilo: dibujo de hoja de inspección de taller — trazo grueso, curvas orgánicas,
 * paneles claramente delimitados (puertas, guardabarros, capó, baúl), ventanas marcadas.
 * Proporciones de sedán/SUV moderno compacto.
 */

import type { SVGProps } from "react";

export type VehicleView = "front" | "back" | "left" | "right" | "top";

export const VIEW_LABELS: Record<VehicleView, string> = {
  front: "Frente",
  back: "Atrás",
  left: "Izquierda",
  right: "Derecha",
  top: "Superior",
};

export const VIEW_DIMENSIONS: Record<VehicleView, { w: number; h: number }> = {
  front: { w: 260, h: 220 },
  back: { w: 260, h: 220 },
  left: { w: 440, h: 180 },
  right: { w: 440, h: 180 },
  top: { w: 440, h: 160 },
};

interface SilhouetteProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/** Vista frontal */
export function FrontSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
        {/* Contorno exterior carrocería */}
        <path d="M 45 165 L 45 120 C 45 105 50 95 60 88 L 75 80 L 88 45 C 92 32 102 26 118 24 L 130 23 L 142 24 C 158 26 168 32 172 45 L 185 80 L 200 88 C 210 95 215 105 215 120 L 215 165" />
        {/* Bumper inferior */}
        <path d="M 45 165 C 42 168 40 173 42 178 L 48 185 L 80 188 C 85 188 88 186 88 183 L 88 178 L 172 178 L 172 183 C 172 186 175 188 180 188 L 212 185 L 218 178 C 220 173 218 168 215 165" />
        {/* Parabrisas */}
        <path d="M 88 45 C 110 40 150 40 172 45" />
        {/* Línea capó inferior */}
        <path d="M 75 80 C 110 75 150 75 185 80" />
        {/* Faro izquierdo */}
        <path d="M 50 95 C 50 90 55 87 62 87 L 85 85 C 90 85 92 88 92 92 L 92 108 C 92 112 90 115 85 115 L 62 113 C 55 113 50 110 50 105 Z" />
        {/* Faro derecho */}
        <path d="M 210 95 C 210 90 205 87 198 87 L 175 85 C 170 85 168 88 168 92 L 168 108 C 168 112 170 115 175 115 L 198 113 C 205 113 210 110 210 105 Z" />
        {/* Parrilla */}
        <path d="M 98 115 C 115 113 145 113 162 115 L 162 135 C 145 137 115 137 98 135 Z" />
        <path d="M 105 122 L 155 122" />
        <path d="M 105 128 L 155 128" />
        {/* Toma de aire / bumper */}
        <path d="M 68 142 C 100 140 160 140 192 142 L 192 162 C 160 164 100 164 68 162 Z" />
        {/* Placa */}
        <rect x="112" y="148" width="36" height="10" rx="2" />
        {/* Espejos */}
        <path d="M 32 82 C 30 80 30 76 33 74 L 42 72 L 45 88 L 36 90 C 32 90 30 87 32 82 Z" />
        <path d="M 228 82 C 230 80 230 76 227 74 L 218 72 L 215 88 L 224 90 C 228 90 230 87 228 82 Z" />
        {/* Ruedas asomando */}
        <path d="M 55 188 L 55 196 C 55 204 62 208 72 208 L 92 208 C 102 208 108 204 108 196 L 108 188" />
        <path d="M 152 188 L 152 196 C 152 204 158 208 168 208 L 188 208 C 198 208 205 204 205 196 L 205 188" />
        {/* Neblineros */}
        <circle cx="78" cy="154" r="5" />
        <circle cx="182" cy="154" r="5" />
      </g>
    </svg>
  );
}

/** Vista trasera */
export function BackSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 260 220" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
        {/* Contorno exterior */}
        <path d="M 45 165 L 45 120 C 45 105 50 95 60 88 L 75 80 L 88 45 C 92 32 102 26 118 24 L 130 23 L 142 24 C 158 26 168 32 172 45 L 185 80 L 200 88 C 210 95 215 105 215 120 L 215 165" />
        {/* Bumper */}
        <path d="M 45 165 C 42 168 40 173 42 178 L 48 185 L 80 188 C 85 188 88 186 88 183 L 88 178 L 172 178 L 172 183 C 172 186 175 188 180 188 L 212 185 L 218 178 C 220 173 218 168 215 165" />
        {/* Cristal trasero */}
        <path d="M 88 45 C 110 40 150 40 172 45" />
        <path d="M 75 80 C 110 75 150 75 185 80" />
        {/* Baúl / portón */}
        <path d="M 80 80 L 80 120 C 110 118 150 118 180 120 L 180 80" />
        {/* Luces traseras */}
        <path d="M 48 90 L 48 130 C 48 135 52 138 58 138 L 78 136 L 78 88 L 58 86 C 52 86 48 88 48 90 Z" />
        <path d="M 212 90 L 212 130 C 212 135 208 138 202 138 L 182 136 L 182 88 L 202 86 C 208 86 212 88 212 90 Z" />
        {/* Bumper detalles */}
        <path d="M 65 145 C 100 143 160 143 195 145 L 195 168 C 160 170 100 170 65 168 Z" />
        {/* Placa */}
        <rect x="112" y="150" width="36" height="10" rx="2" />
        {/* Escapes */}
        <ellipse cx="92" cy="180" rx="8" ry="4" />
        <ellipse cx="168" cy="180" rx="8" ry="4" />
        {/* Espejos */}
        <path d="M 32 82 C 30 80 30 76 33 74 L 42 72 L 45 88 L 36 90 C 32 90 30 87 32 82 Z" />
        <path d="M 228 82 C 230 80 230 76 227 74 L 218 72 L 215 88 L 224 90 C 228 90 230 87 228 82 Z" />
        {/* Ruedas */}
        <path d="M 55 188 L 55 196 C 55 204 62 208 72 208 L 92 208 C 102 208 108 204 108 196 L 108 188" />
        <path d="M 152 188 L 152 196 C 152 204 158 208 168 208 L 188 208 C 198 208 205 204 205 196 L 205 188" />
        {/* Reflectores */}
        <rect x="82" y="155" width="14" height="5" rx="2.5" />
        <rect x="164" y="155" width="14" height="5" rx="2.5" />
      </g>
    </svg>
  );
}

/** Vista lateral izquierda — estilo hoja de inspección con paneles marcados */
export function LeftSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
        {/* Contorno principal del cuerpo */}
        <path d="M 28 118 L 28 95 C 28 82 35 75 48 70 L 78 62 L 112 55 L 140 30 C 145 25 152 22 162 20 L 200 18 C 240 17 280 18 310 20 L 320 22 C 330 25 335 30 338 35 L 362 60 L 395 68 L 412 75 C 420 80 422 88 422 98 L 422 118" />
        {/* Línea del techo */}
        <path d="M 140 30 C 200 16 300 16 338 35" />
        {/* Ventanas (área oscura en la hoja) */}
        <path d="M 142 30 L 118 58 C 116 61 118 64 122 64 L 354 64 C 358 64 360 61 358 58 L 340 35" />
        {/* Pilar A */}
        <path d="M 136 28 L 112 62" />
        {/* Pilar B */}
        <path d="M 218 20 L 218 64" />
        {/* Pilar C */}
        <path d="M 312 20 L 312 64" />
        {/* Pilar D */}
        <path d="M 342 32 L 362 62" />
        {/* Línea de cintura / moldura lateral */}
        <path d="M 35 85 C 130 78 320 78 415 85" />
        {/* Puerta delantera */}
        <path d="M 145 64 L 145 118" />
        {/* Puerta trasera */}
        <path d="M 232 64 L 232 118" />
        {/* Separación guardabarros trasero */}
        <path d="M 325 64 L 325 118" />
        {/* Manijas de puertas */}
        <path d="M 175 78 L 192 78 C 194 78 194 80 194 82 L 175 82 C 173 82 173 78 175 78 Z" />
        <path d="M 265 78 L 282 78 C 284 78 284 80 284 82 L 265 82 C 263 82 263 78 265 78 Z" />
        {/* Guardabarros / falda inferior */}
        <path d="M 28 118 L 28 128 C 28 134 32 136 38 136 L 62 136" />
        <path d="M 130 136 L 298 136" />
        <path d="M 368 136 L 405 136 C 412 136 416 134 416 128 L 422 118" />
        {/* Estribo */}
        <path d="M 138 130 L 306 130 L 306 136 L 138 136 Z" />
        {/* Rueda delantera */}
        <circle cx="96" cy="136" r="28" />
        <circle cx="96" cy="136" r="18" />
        <circle cx="96" cy="136" r="5" />
        {/* Rueda trasera */}
        <circle cx="333" cy="136" r="28" />
        <circle cx="333" cy="136" r="18" />
        <circle cx="333" cy="136" r="5" />
        {/* Faro delantero */}
        <path d="M 28 78 L 28 98 C 28 102 32 105 38 104 L 60 100 L 60 76 L 38 72 C 32 71 28 74 28 78 Z" />
        {/* Luz trasera */}
        <path d="M 422 78 L 422 98 C 422 102 418 105 412 104 L 395 100 L 395 76 L 412 72 C 418 71 422 74 422 78 Z" />
        {/* Espejo */}
        <path d="M 108 52 L 100 48 C 97 46 96 48 96 52 L 96 62 L 108 62 Z" />
        {/* Detalle guardabarros delantero: moldura del arco */}
        <path d="M 60 118 C 65 105 78 98 96 98 C 114 98 127 105 130 118" />
        {/* Detalle guardabarros trasero: moldura del arco */}
        <path d="M 300 118 C 305 105 318 98 333 98 C 350 98 362 105 368 118" />
      </g>
    </svg>
  );
}

/** Vista lateral derecha — espejada */
export function RightSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" transform="translate(440, 0) scale(-1, 1)">
        {/* Misma geometría que Left, espejada */}
        <path d="M 28 118 L 28 95 C 28 82 35 75 48 70 L 78 62 L 112 55 L 140 30 C 145 25 152 22 162 20 L 200 18 C 240 17 280 18 310 20 L 320 22 C 330 25 335 30 338 35 L 362 60 L 395 68 L 412 75 C 420 80 422 88 422 98 L 422 118" />
        <path d="M 140 30 C 200 16 300 16 338 35" />
        <path d="M 142 30 L 118 58 C 116 61 118 64 122 64 L 354 64 C 358 64 360 61 358 58 L 340 35" />
        <path d="M 136 28 L 112 62" />
        <path d="M 218 20 L 218 64" />
        <path d="M 312 20 L 312 64" />
        <path d="M 342 32 L 362 62" />
        <path d="M 35 85 C 130 78 320 78 415 85" />
        <path d="M 145 64 L 145 118" />
        <path d="M 232 64 L 232 118" />
        <path d="M 325 64 L 325 118" />
        <path d="M 175 78 L 192 78 C 194 78 194 80 194 82 L 175 82 C 173 82 173 78 175 78 Z" />
        <path d="M 265 78 L 282 78 C 284 78 284 80 284 82 L 265 82 C 263 82 263 78 265 78 Z" />
        <path d="M 28 118 L 28 128 C 28 134 32 136 38 136 L 62 136" />
        <path d="M 130 136 L 298 136" />
        <path d="M 368 136 L 405 136 C 412 136 416 134 416 128 L 422 118" />
        <path d="M 138 130 L 306 130 L 306 136 L 138 136 Z" />
        <circle cx="96" cy="136" r="28" />
        <circle cx="96" cy="136" r="18" />
        <circle cx="96" cy="136" r="5" />
        <circle cx="333" cy="136" r="28" />
        <circle cx="333" cy="136" r="18" />
        <circle cx="333" cy="136" r="5" />
        <path d="M 28 78 L 28 98 C 28 102 32 105 38 104 L 60 100 L 60 76 L 38 72 C 32 71 28 74 28 78 Z" />
        <path d="M 422 78 L 422 98 C 422 102 418 105 412 104 L 395 100 L 395 76 L 412 72 C 418 71 422 74 422 78 Z" />
        <path d="M 108 52 L 100 48 C 97 46 96 48 96 52 L 96 62 L 108 62 Z" />
        <path d="M 60 118 C 65 105 78 98 96 98 C 114 98 127 105 130 118" />
        <path d="M 300 118 C 305 105 318 98 333 98 C 350 98 362 105 368 118" />
      </g>
    </svg>
  );
}

/** Vista superior — auto desde arriba, estilo hoja de inspección */
export function TopSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 440 160" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
        {/* Contorno exterior */}
        <path d="M 40 48 C 35 52 30 60 28 70 L 26 80 C 26 90 28 92 30 92 L 38 108 C 42 115 52 118 65 120 L 100 122 C 200 126 340 126 380 122 L 400 120 C 415 118 420 112 422 105 L 428 88 C 430 80 428 70 425 62 L 420 52 C 416 46 408 42 395 40 L 360 38 C 280 34 160 34 100 38 L 65 40 C 50 42 44 44 40 48 Z" />
        {/* Parabrisas */}
        <path d="M 80 50 C 80 46 88 44 98 43 L 140 41 C 180 39 220 40 250 42 L 268 43 C 278 44 282 46 282 50 L 282 62 C 220 58 100 58 80 62 Z" />
        {/* Cristal trasero */}
        <path d="M 330 50 C 330 46 338 44 348 43 L 372 42 C 390 41 402 43 410 46 C 414 48 416 50 416 54 L 416 62 C 380 58 340 58 330 62 Z" />
        {/* Techo (panel central) */}
        <path d="M 82 65 C 180 60 360 60 410 65 L 410 95 C 360 100 180 100 82 95 Z" />
        {/* Capó */}
        <path d="M 35 55 C 36 50 42 47 52 45 L 75 43 C 76 58 76 80 75 100 L 55 98 C 42 96 36 92 35 88 Z" />
        {/* Baúl */}
        <path d="M 418 55 C 416 50 412 47 402 45 L 382 43 C 380 58 380 80 382 100 L 400 98 C 412 96 416 92 418 88 Z" />
        {/* Espejos */}
        <ellipse cx="80" cy="38" rx="10" ry="5" />
        <ellipse cx="80" cy="122" rx="10" ry="5" />
        {/* Ruedas */}
        <rect x="52" y="28" width="30" height="10" rx="4" />
        <rect x="52" y="122" width="30" height="10" rx="4" />
        <rect x="365" y="28" width="30" height="10" rx="4" />
        <rect x="365" y="122" width="30" height="10" rx="4" />
        {/* Líneas de puertas */}
        <path d="M 140 38 L 140 122" />
        <path d="M 232 38 L 232 122" />
        <path d="M 320 38 L 320 122" />
      </g>
    </svg>
  );
}

/** Mapa de componentes por vista */
export const SILHOUETTE_COMPONENTS: Record<VehicleView, React.ComponentType<SilhouetteProps>> = {
  front: FrontSilhouette,
  back: BackSilhouette,
  left: LeftSilhouette,
  right: RightSilhouette,
  top: TopSilhouette,
};
