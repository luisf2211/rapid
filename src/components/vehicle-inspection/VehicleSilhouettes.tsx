/**
 * Siluetas SVG realistas de vehículo (tipo sedán) para el diagrama de inspección.
 * Estilo blueprint/diagrama técnico: proporciones reales, líneas limpias, sin relleno.
 * Cada vista usa un viewBox estandarizado para facilitar el posicionamiento de anotaciones.
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

/** Dimensiones del viewBox para cada vista (ancho x alto) */
export const VIEW_DIMENSIONS: Record<VehicleView, { w: number; h: number }> = {
  front: { w: 300, h: 250 },
  back: { w: 300, h: 250 },
  left: { w: 500, h: 200 },
  right: { w: 500, h: 200 },
  top: { w: 500, h: 200 },
};

interface SilhouetteProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

/** Vista frontal — sedán visto de frente */
export function FrontSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 300 250"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
        {/* Carrocería exterior */}
        <path d="M 55 190 L 55 130 Q 55 115 65 108 L 85 95 L 95 55 Q 100 40 115 35 L 150 30 L 185 35 Q 200 40 205 55 L 215 95 L 235 108 Q 245 115 245 130 L 245 190" />
        {/* Línea inferior carrocería */}
        <path d="M 55 190 L 50 195 Q 48 200 50 205 L 55 210 L 85 215 Q 90 217 95 215 L 95 210 L 205 210 L 205 215 Q 210 217 215 215 L 245 210 L 250 205 Q 252 200 250 195 L 245 190" />
        {/* Parabrisas */}
        <path d="M 95 55 Q 150 48 205 55" />
        <path d="M 85 95 Q 150 88 215 95" />
        {/* Línea del capó */}
        <path d="M 85 95 L 85 100 Q 150 95 215 100 L 215 95" />
        {/* Faros */}
        <path d="M 60 120 L 60 110 Q 60 105 68 105 L 95 103 Q 100 103 100 108 L 100 125 Q 100 130 95 130 L 68 128 Q 60 128 60 120 Z" />
        <path d="M 240 120 L 240 110 Q 240 105 232 105 L 205 103 Q 200 103 200 108 L 200 125 Q 200 130 205 130 L 232 128 Q 240 128 240 120 Z" />
        {/* Parrilla */}
        <path d="M 110 130 Q 150 128 190 130 L 190 150 Q 150 152 110 150 Z" />
        <path d="M 120 137 L 180 137" />
        <path d="M 120 143 L 180 143" />
        {/* Bumper / toma de aire inferior */}
        <path d="M 80 160 Q 150 158 220 160 L 220 180 Q 150 182 80 180 Z" />
        {/* Placa */}
        <rect x="130" y="165" width="40" height="12" rx="2" />
        {/* Espejos */}
        <path d="M 40 105 L 40 95 Q 40 90 45 90 L 55 92 L 55 110 L 45 112 Q 40 112 40 107 Z" />
        <path d="M 260 105 L 260 95 Q 260 90 255 90 L 245 92 L 245 110 L 255 112 Q 260 112 260 107 Z" />
        {/* Ruedas (parciales, asomando abajo) */}
        <path d="M 65 210 L 65 220 Q 65 230 75 230 L 100 230 Q 110 230 110 220 L 110 210" />
        <path d="M 190 210 L 190 220 Q 190 230 200 230 L 225 230 Q 235 230 235 220 L 235 210" />
        {/* Neblineros */}
        <circle cx="80" cy="172" r="6" />
        <circle cx="220" cy="172" r="6" />
      </g>
    </svg>
  );
}

/** Vista trasera — sedán visto de atrás */
export function BackSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 300 250"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
        {/* Carrocería exterior */}
        <path d="M 55 190 L 55 130 Q 55 115 65 108 L 85 95 L 95 55 Q 100 40 115 35 L 150 30 L 185 35 Q 200 40 205 55 L 215 95 L 235 108 Q 245 115 245 130 L 245 190" />
        {/* Línea inferior carrocería */}
        <path d="M 55 190 L 50 195 Q 48 200 50 205 L 55 210 L 85 215 Q 90 217 95 215 L 95 210 L 205 210 L 205 215 Q 210 217 215 215 L 245 210 L 250 205 Q 252 200 250 195 L 245 190" />
        {/* Cristal trasero */}
        <path d="M 95 55 Q 150 48 205 55" />
        <path d="M 85 95 Q 150 88 215 95" />
        {/* Baúl / portón */}
        <path d="M 85 95 L 85 105 Q 150 100 215 105 L 215 95" />
        <path d="M 90 105 L 90 140 Q 150 138 210 140 L 210 105" />
        {/* Luces traseras */}
        <path d="M 58 108 L 58 140 Q 58 145 63 145 L 88 143 L 88 105 L 63 105 Q 58 105 58 108 Z" />
        <path d="M 242 108 L 242 140 Q 242 145 237 145 L 212 143 L 212 105 L 237 105 Q 242 105 242 108 Z" />
        {/* Bumper trasero */}
        <path d="M 70 155 Q 150 153 230 155 L 230 185 Q 150 187 70 185 Z" />
        {/* Placa */}
        <rect x="130" y="160" width="40" height="12" rx="2" />
        {/* Escape */}
        <ellipse cx="100" cy="195" rx="8" ry="5" />
        <ellipse cx="200" cy="195" rx="8" ry="5" />
        {/* Espejos */}
        <path d="M 40 105 L 40 95 Q 40 90 45 90 L 55 92 L 55 110 L 45 112 Q 40 112 40 107 Z" />
        <path d="M 260 105 L 260 95 Q 260 90 255 90 L 245 92 L 245 110 L 255 112 Q 260 112 260 107 Z" />
        {/* Ruedas */}
        <path d="M 65 210 L 65 220 Q 65 230 75 230 L 100 230 Q 110 230 110 220 L 110 210" />
        <path d="M 190 210 L 190 220 Q 190 230 200 230 L 225 230 Q 235 230 235 220 L 235 210" />
        {/* Reflectores */}
        <rect x="90" y="170" width="16" height="6" rx="3" />
        <rect x="194" y="170" width="16" height="6" rx="3" />
      </g>
    </svg>
  );
}

/** Vista lateral izquierda — sedán de perfil (frente hacia la izquierda) */
export function LeftSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 500 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
        {/* Contorno principal del cuerpo */}
        <path d="M 30 130 L 30 110 Q 30 95 45 88 L 80 78 L 120 72 L 155 42 Q 160 37 170 35 L 210 32 Q 280 30 330 32 L 345 35 Q 355 37 358 42 L 385 72 L 430 78 L 460 88 Q 470 95 470 110 L 470 130" />
        {/* Línea del techo */}
        <path d="M 155 42 Q 250 28 358 42" />
        {/* Cristales (parabrisas + laterales + cristal trasero) */}
        <path d="M 155 42 L 130 72 L 128 75 Q 128 78 132 78 L 380 78 Q 384 78 384 75 L 382 72 L 358 42" />
        {/* Pilar A */}
        <path d="M 148 42 L 125 75" />
        {/* Pilar B */}
        <path d="M 240 35 L 240 78" />
        {/* Pilar C */}
        <path d="M 340 35 L 340 78" />
        {/* Pilar D / cristal trasero */}
        <path d="M 362 42 L 388 75" />
        {/* Línea de cintura */}
        <path d="M 30 100 Q 250 92 470 100" />
        {/* Puertas */}
        <path d="M 160 78 L 160 130" />
        <path d="M 255 78 L 255 130" />
        <path d="M 345 78 L 345 130" />
        {/* Manijas */}
        <rect x="190" y="90" width="16" height="4" rx="2" />
        <rect x="285" y="90" width="16" height="4" rx="2" />
        {/* Guardabarros / línea inferior */}
        <path d="M 30 130 L 30 140 Q 30 148 38 148 L 75 148" />
        <path d="M 145 148 L 350 148" />
        <path d="M 420 148 L 462 148 Q 470 148 470 140 L 470 130" />
        {/* Rueda delantera */}
        <circle cx="110" cy="148" r="30" />
        <circle cx="110" cy="148" r="20" />
        <circle cx="110" cy="148" r="6" />
        {/* Rueda trasera */}
        <circle cx="385" cy="148" r="30" />
        <circle cx="385" cy="148" r="20" />
        <circle cx="385" cy="148" r="6" />
        {/* Faro delantero */}
        <path d="M 30 100 L 30 120 Q 30 125 35 125 L 65 122 L 65 98 L 35 95 Q 30 95 30 100 Z" />
        {/* Luz trasera */}
        <path d="M 470 100 L 470 120 Q 470 125 465 125 L 445 122 L 445 98 L 465 95 Q 470 95 470 100 Z" />
        {/* Espejo */}
        <path d="M 122 70 L 115 65 Q 112 63 112 67 L 112 78 L 122 78 Z" />
        {/* Estribo */}
        <rect x="155" y="142" width="200" height="6" rx="2" />
      </g>
    </svg>
  );
}

/** Vista lateral derecha — espejada de la izquierda */
export function RightSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 500 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" transform="translate(500, 0) scale(-1, 1)">
        {/* Misma geometría que Left, espejada vía transform */}
        <path d="M 30 130 L 30 110 Q 30 95 45 88 L 80 78 L 120 72 L 155 42 Q 160 37 170 35 L 210 32 Q 280 30 330 32 L 345 35 Q 355 37 358 42 L 385 72 L 430 78 L 460 88 Q 470 95 470 110 L 470 130" />
        <path d="M 155 42 Q 250 28 358 42" />
        <path d="M 155 42 L 130 72 L 128 75 Q 128 78 132 78 L 380 78 Q 384 78 384 75 L 382 72 L 358 42" />
        <path d="M 148 42 L 125 75" />
        <path d="M 240 35 L 240 78" />
        <path d="M 340 35 L 340 78" />
        <path d="M 362 42 L 388 75" />
        <path d="M 30 100 Q 250 92 470 100" />
        <path d="M 160 78 L 160 130" />
        <path d="M 255 78 L 255 130" />
        <path d="M 345 78 L 345 130" />
        <rect x="190" y="90" width="16" height="4" rx="2" />
        <rect x="285" y="90" width="16" height="4" rx="2" />
        <path d="M 30 130 L 30 140 Q 30 148 38 148 L 75 148" />
        <path d="M 145 148 L 350 148" />
        <path d="M 420 148 L 462 148 Q 470 148 470 140 L 470 130" />
        <circle cx="110" cy="148" r="30" />
        <circle cx="110" cy="148" r="20" />
        <circle cx="110" cy="148" r="6" />
        <circle cx="385" cy="148" r="30" />
        <circle cx="385" cy="148" r="20" />
        <circle cx="385" cy="148" r="6" />
        <path d="M 30 100 L 30 120 Q 30 125 35 125 L 65 122 L 65 98 L 35 95 Q 30 95 30 100 Z" />
        <path d="M 470 100 L 470 120 Q 470 125 465 125 L 445 122 L 445 98 L 465 95 Q 470 95 470 100 Z" />
        <path d="M 122 70 L 115 65 Q 112 63 112 67 L 112 78 L 122 78 Z" />
        <rect x="155" y="142" width="200" height="6" rx="2" />
      </g>
    </svg>
  );
}

/** Vista superior — sedán visto desde arriba (frente hacia la izquierda) */
export function TopSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 500 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
        {/* Contorno exterior del vehículo */}
        <path d="M 40 60 Q 35 65 30 80 L 25 100 Q 25 120 30 120 L 40 140 Q 45 145 60 148 L 100 150 Q 250 155 400 150 L 440 148 Q 455 145 460 140 L 470 120 Q 475 100 470 80 L 460 60 Q 455 55 440 52 L 400 50 Q 250 45 100 50 L 60 52 Q 45 55 40 60 Z" />
        {/* Parabrisas */}
        <path d="M 85 65 Q 85 60 95 58 L 150 56 Q 200 54 250 56 L 290 58 Q 300 60 300 65 L 300 75 Q 250 72 85 75 Z" />
        {/* Cristal trasero */}
        <path d="M 350 65 Q 350 60 360 58 L 390 56 Q 420 54 440 58 Q 450 60 450 65 L 450 75 Q 400 72 350 75 Z" />
        {/* Techo */}
        <path d="M 95 78 Q 250 73 440 78 L 440 122 Q 250 127 95 122 Z" />
        {/* Capó */}
        <path d="M 40 70 Q 40 65 50 63 L 80 60 Q 82 78 82 100 Q 82 122 80 140 L 50 137 Q 40 135 40 130 Z" />
        {/* Baúl */}
        <path d="M 460 70 Q 460 65 452 63 L 420 60 Q 418 78 418 100 Q 418 122 420 140 L 452 137 Q 460 135 460 130 Z" />
        {/* Espejos */}
        <ellipse cx="95" cy="55" rx="12" ry="6" />
        <ellipse cx="95" cy="145" rx="12" ry="6" />
        {/* Ruedas (visibles como rectángulos redondeados) */}
        <rect x="60" y="42" width="35" height="12" rx="4" />
        <rect x="60" y="146" width="35" height="12" rx="4" />
        <rect x="395" y="42" width="35" height="12" rx="4" />
        <rect x="395" y="146" width="35" height="12" rx="4" />
        {/* Líneas de las puertas */}
        <path d="M 155 52 L 155 148" />
        <path d="M 250 52 L 250 148" />
        <path d="M 345 52 L 345 148" />
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
