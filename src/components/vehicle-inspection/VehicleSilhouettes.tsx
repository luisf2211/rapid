/**
 * Siluetas SVG de vehículo sedán para inspección.
 * Referencia visual: sedán compacto moderno (tipo Civic).
 * Estilo: trazo limpio, líneas continuas, paneles claros, proporciones reales.
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
  front: { w: 280, h: 230 },
  back: { w: 280, h: 230 },
  left: { w: 480, h: 180 },
  right: { w: 480, h: 180 },
  top: { w: 480, h: 170 },
};

interface SilhouetteProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/** Vista frontal — sedán compacto moderno */
export function FrontSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
        {/* Silueta exterior completa */}
        <path d="
          M 52 172
          L 52 128 C 52 112 58 104 70 97 L 82 91
          L 92 52 C 97 36 108 28 125 26 L 140 25 L 155 26 C 172 28 183 36 188 52 L 198 91
          L 210 97 C 222 104 228 112 228 128 L 228 172
          L 228 178 C 228 183 225 186 220 186 L 205 186 C 200 186 198 184 198 180 L 198 176
          L 82 176 L 82 180 C 82 184 80 186 75 186 L 60 186 C 55 186 52 183 52 178 Z
        " />
        {/* Parabrisas */}
        <path d="M 92 52 C 120 46 160 46 188 52" />
        {/* Línea inferior del parabrisas / capó */}
        <path d="M 82 91 C 120 86 160 86 198 91" />
        {/* Capó curva */}
        <path d="M 82 91 L 82 97 C 130 93 150 93 198 97 L 198 91" />
        {/* Faro izquierdo — angular moderno */}
        <path d="M 55 100 L 56 95 C 57 91 62 89 68 89 L 87 88 C 90 88 92 90 92 94 L 92 112 C 92 116 90 118 87 118 L 65 116 C 58 115 55 112 55 107 Z" />
        {/* Faro derecho */}
        <path d="M 225 100 L 224 95 C 223 91 218 89 212 89 L 193 88 C 190 88 188 90 188 94 L 188 112 C 188 116 190 118 193 118 L 215 116 C 222 115 225 112 225 107 Z" />
        {/* Parrilla superior */}
        <path d="M 100 118 C 125 116 155 116 180 118 L 180 130 C 155 132 125 132 100 130 Z" />
        {/* Parrilla líneas */}
        <line x1="108" y1="123" x2="172" y2="123" />
        {/* Toma de aire inferior */}
        <path d="M 72 138 C 110 136 170 136 208 138 L 208 160 C 170 162 110 162 72 160 Z" />
        {/* Placa */}
        <rect x="120" y="143" width="40" height="12" rx="2" />
        {/* Neblineros */}
        <path d="M 62 142 C 62 139 65 137 68 137 L 78 137 C 81 137 83 139 83 142 L 83 152 C 83 155 81 157 78 157 L 68 157 C 65 157 62 155 62 152 Z" />
        <path d="M 218 142 C 218 139 215 137 212 137 L 202 137 C 199 137 197 139 197 142 L 197 152 C 197 155 199 157 202 157 L 212 157 C 215 157 218 155 218 152 Z" />
        {/* Espejos laterales */}
        <path d="M 38 85 L 38 77 C 38 74 40 72 43 72 L 50 73 L 52 91 L 45 92 C 41 92 38 90 38 87 Z" />
        <path d="M 242 85 L 242 77 C 242 74 240 72 237 72 L 230 73 L 228 91 L 235 92 C 239 92 242 90 242 87 Z" />
        {/* Ruedas parciales */}
        <path d="M 60 186 L 60 195 C 60 205 68 210 80 210 L 100 210 C 112 210 118 205 118 195 L 118 186" />
        <path d="M 162 186 L 162 195 C 162 205 170 210 182 210 L 200 210 C 212 210 220 205 220 195 L 220 186" />
      </g>
    </svg>
  );
}

/** Vista trasera */
export function BackSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
        {/* Silueta exterior */}
        <path d="
          M 52 172
          L 52 128 C 52 112 58 104 70 97 L 82 91
          L 92 52 C 97 36 108 28 125 26 L 140 25 L 155 26 C 172 28 183 36 188 52 L 198 91
          L 210 97 C 222 104 228 112 228 128 L 228 172
          L 228 178 C 228 183 225 186 220 186 L 205 186 C 200 186 198 184 198 180 L 198 176
          L 82 176 L 82 180 C 82 184 80 186 75 186 L 60 186 C 55 186 52 183 52 178 Z
        " />
        {/* Cristal trasero */}
        <path d="M 92 52 C 120 46 160 46 188 52" />
        <path d="M 82 91 C 120 86 160 86 198 91" />
        {/* Baúl */}
        <path d="M 85 91 L 85 108 C 120 106 160 106 195 108 L 195 91" />
        {/* Luces traseras — forma angular que envuelve la esquina */}
        <path d="M 52 94 L 52 128 C 52 132 55 134 60 134 L 82 132 L 82 92 L 60 90 C 55 90 52 92 52 94 Z" />
        <path d="M 228 94 L 228 128 C 228 132 225 134 220 134 L 198 132 L 198 92 L 220 90 C 225 90 228 92 228 94 Z" />
        {/* Bumper trasero */}
        <path d="M 62 140 C 100 138 180 138 218 140 L 218 168 C 180 170 100 170 62 168 Z" />
        {/* Placa */}
        <rect x="120" y="146" width="40" height="12" rx="2" />
        {/* Reflectores */}
        <rect x="78" y="152" width="15" height="5" rx="2.5" />
        <rect x="187" y="152" width="15" height="5" rx="2.5" />
        {/* Escapes */}
        <ellipse cx="95" cy="176" rx="7" ry="4" />
        <ellipse cx="185" cy="176" rx="7" ry="4" />
        {/* Espejos */}
        <path d="M 38 85 L 38 77 C 38 74 40 72 43 72 L 50 73 L 52 91 L 45 92 C 41 92 38 90 38 87 Z" />
        <path d="M 242 85 L 242 77 C 242 74 240 72 237 72 L 230 73 L 228 91 L 235 92 C 239 92 242 90 242 87 Z" />
        {/* Ruedas */}
        <path d="M 60 186 L 60 195 C 60 205 68 210 80 210 L 100 210 C 112 210 118 205 118 195 L 118 186" />
        <path d="M 162 186 L 162 195 C 162 205 170 210 182 210 L 200 210 C 212 210 220 205 220 195 L 220 186" />
      </g>
    </svg>
  );
}

/** Vista lateral izquierda — perfil de sedán moderno, techo inclinado */
export function LeftSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
        {/* Carrocería completa — perfil sedan moderno */}
        <path d="
          M 24 115
          L 24 95 C 24 82 30 76 42 72 L 72 64
          L 105 57 L 138 28 C 143 23 150 20 160 19
          L 200 17 C 250 16 295 17 320 19 L 332 21 C 342 24 348 28 352 34
          L 374 58 L 408 66 L 432 72 C 445 76 452 84 452 96
          L 452 115
        " />
        {/* Techo — curva descendente hacia atrás (tipo fastback/civic) */}
        <path d="M 138 28 C 180 14 320 14 352 34" />
        {/* Cristales — área de ventanas */}
        <path d="
          M 140 28 L 115 56 C 113 59 115 62 119 62
          L 368 62 C 372 62 374 59 372 56 L 354 34
        " />
        {/* Pilar A (delantero) */}
        <path d="M 132 26 L 108 58" />
        {/* Pilar B (central) */}
        <path d="M 222 18 L 222 62" />
        {/* Pilar C (trasero) */}
        <path d="M 322 18 L 322 62" />
        {/* Pilar D / fin cristal trasero */}
        <path d="M 356 32 L 378 58" />
        {/* Línea de carácter / moldura lateral */}
        <path d="M 30 82 C 150 75 350 75 448 82" />
        {/* Puerta delantera */}
        <path d="M 150 62 L 150 115" />
        {/* Puerta trasera */}
        <path d="M 240 62 L 240 115" />
        {/* Línea guardabarros trasero */}
        <path d="M 336 62 L 336 115" />
        {/* Manijas */}
        <rect x="178" y="76" width="16" height="4" rx="2" />
        <rect x="272" y="76" width="16" height="4" rx="2" />
        {/* Falda inferior / umbral */}
        <path d="M 24 115 L 24 125 C 24 130 28 132 34 132 L 58 132" />
        <path d="M 126 132 L 310 132" />
        <path d="M 380 132 L 420 132 C 428 132 432 130 432 125 L 452 115" />
        {/* Estribo */}
        <rect x="140" y="126" width="178" height="6" rx="2" />
        {/* Rueda delantera */}
        <circle cx="92" cy="132" r="27" />
        <circle cx="92" cy="132" r="18" />
        <circle cx="92" cy="132" r="5" />
        {/* Rueda trasera */}
        <circle cx="345" cy="132" r="27" />
        <circle cx="345" cy="132" r="18" />
        <circle cx="345" cy="132" r="5" />
        {/* Arco de rueda delantero */}
        <path d="M 58 115 C 62 100 75 92 92 92 C 109 92 122 100 126 115" />
        {/* Arco de rueda trasero */}
        <path d="M 310 115 C 315 100 328 92 345 92 C 362 92 375 100 380 115" />
        {/* Faro delantero */}
        <path d="M 24 80 L 24 100 C 24 104 28 106 34 106 L 58 102 L 58 76 L 34 72 C 28 71 24 74 24 80 Z" />
        {/* Luz trasera */}
        <path d="M 452 80 L 452 100 C 452 104 448 106 442 106 L 422 102 L 422 76 L 442 72 C 448 71 452 74 452 80 Z" />
        {/* Espejo retrovisor */}
        <path d="M 106 50 L 98 45 C 95 43 94 45 94 48 L 94 58 L 106 60 Z" />
      </g>
    </svg>
  );
}

/** Vista lateral derecha — espejo de la izquierda */
export function RightSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" transform="translate(480, 0) scale(-1, 1)">
        {/* Misma geometría espejada */}
        <path d="M 24 115 L 24 95 C 24 82 30 76 42 72 L 72 64 L 105 57 L 138 28 C 143 23 150 20 160 19 L 200 17 C 250 16 295 17 320 19 L 332 21 C 342 24 348 28 352 34 L 374 58 L 408 66 L 432 72 C 445 76 452 84 452 96 L 452 115" />
        <path d="M 138 28 C 180 14 320 14 352 34" />
        <path d="M 140 28 L 115 56 C 113 59 115 62 119 62 L 368 62 C 372 62 374 59 372 56 L 354 34" />
        <path d="M 132 26 L 108 58" />
        <path d="M 222 18 L 222 62" />
        <path d="M 322 18 L 322 62" />
        <path d="M 356 32 L 378 58" />
        <path d="M 30 82 C 150 75 350 75 448 82" />
        <path d="M 150 62 L 150 115" />
        <path d="M 240 62 L 240 115" />
        <path d="M 336 62 L 336 115" />
        <rect x="178" y="76" width="16" height="4" rx="2" />
        <rect x="272" y="76" width="16" height="4" rx="2" />
        <path d="M 24 115 L 24 125 C 24 130 28 132 34 132 L 58 132" />
        <path d="M 126 132 L 310 132" />
        <path d="M 380 132 L 420 132 C 428 132 432 130 432 125 L 452 115" />
        <rect x="140" y="126" width="178" height="6" rx="2" />
        <circle cx="92" cy="132" r="27" />
        <circle cx="92" cy="132" r="18" />
        <circle cx="92" cy="132" r="5" />
        <circle cx="345" cy="132" r="27" />
        <circle cx="345" cy="132" r="18" />
        <circle cx="345" cy="132" r="5" />
        <path d="M 58 115 C 62 100 75 92 92 92 C 109 92 122 100 126 115" />
        <path d="M 310 115 C 315 100 328 92 345 92 C 362 92 375 100 380 115" />
        <path d="M 24 80 L 24 100 C 24 104 28 106 34 106 L 58 102 L 58 76 L 34 72 C 28 71 24 74 24 80 Z" />
        <path d="M 452 80 L 452 100 C 452 104 448 106 442 106 L 422 102 L 422 76 L 442 72 C 448 71 452 74 452 80 Z" />
        <path d="M 106 50 L 98 45 C 95 43 94 45 94 48 L 94 58 L 106 60 Z" />
      </g>
    </svg>
  );
}

/** Vista superior — sedán desde arriba */
export function TopSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 480 170" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round">
        {/* Contorno exterior del cuerpo */}
        <path d="
          M 38 50 C 34 54 30 62 28 72 L 26 85
          C 26 98 28 100 30 102 L 36 115 C 40 120 50 124 62 126
          L 95 128 C 200 132 360 132 400 128 L 420 126
          C 435 124 440 118 443 112 L 448 98 C 450 85 448 72 445 62
          L 440 52 C 436 46 428 42 415 40 L 380 38
          C 300 34 160 34 95 38 L 62 40 C 48 42 42 46 38 50 Z
        " />
        {/* Parabrisas */}
        <path d="
          M 78 52 C 78 47 85 44 95 43
          L 142 40 C 190 38 220 38 252 40 L 275 43
          C 285 44 290 47 290 52
          L 290 65 C 240 61 110 61 78 65 Z
        " />
        {/* Cristal trasero */}
        <path d="
          M 340 52 C 340 47 348 44 356 43
          L 380 41 C 400 40 415 42 425 46
          C 430 48 432 51 432 55
          L 432 65 C 400 61 350 61 340 65 Z
        " />
        {/* Panel del techo */}
        <path d="M 82 68 C 200 63 380 63 428 68 L 428 102 C 380 107 200 107 82 102 Z" />
        {/* Capó */}
        <path d="M 36 58 C 37 52 44 48 54 46 L 74 44 C 75 60 75 85 74 110 L 54 108 C 42 106 36 100 36 94 Z" />
        {/* Baúl */}
        <path d="M 440 58 C 438 52 432 48 422 46 L 402 44 C 400 60 400 85 402 110 L 422 108 C 432 106 438 100 440 94 Z" />
        {/* Espejos */}
        <ellipse cx="78" cy="38" rx="10" ry="5" />
        <ellipse cx="78" cy="132" rx="10" ry="5" />
        {/* Ruedas (vista superior = rectángulos) */}
        <rect x="48" y="28" width="28" height="10" rx="4" />
        <rect x="48" y="132" width="28" height="10" rx="4" />
        <rect x="385" y="28" width="28" height="10" rx="4" />
        <rect x="385" y="132" width="28" height="10" rx="4" />
        {/* Líneas de puertas */}
        <path d="M 148 38 L 148 132" />
        <path d="M 238 38 L 238 132" />
        <path d="M 332 38 L 332 132" />
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
