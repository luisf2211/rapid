/**
 * Siluetas SVG de vehículo sedán para inspección de daños.
 *
 * Geometría derivada de las proporciones reales de un Honda Civic sedán
 * 10ª gen (4630×1799×1416 mm, batalla 2700, rueda Ø660): cada vista se
 * traza a escala sobre su lienzo, no a ojo. Estilo de hoja profesional de
 * "vehicle condition report": dibujo técnico de línea con JERARQUÍA DE
 * GROSORES (contorno exterior grueso, cortes de panel medios, creases
 * finos), carrocería blanca y cristales con tinte suave — un lienzo limpio
 * donde las marcas rojas de daño resaltan.
 *
 * Contrato estable (no cambiar sin revisar anotaciones guardadas):
 * - Mismos viewBox por vista (las marcas se guardan en % del lienzo).
 * - Frente del auto a la IZQUIERDA en laterales y vista superior.
 * - Fills explícitos (sin currentColor): el color externo queda inerte.
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

/* ------------------------------------------------------------------ */
/* Sistema de línea técnica (jerarquía de grosores)                    */
/* ------------------------------------------------------------------ */

const INK = "#3f4753"; // contorno exterior
const MID = "#5b6470"; // cortes de panel y piezas
const SOFT = "#a7adb6"; // creases / detalles ligeros
const GLASS = "#e8ecf0"; // tinte de cristales
const BODY = "#ffffff";

/** Contorno exterior de carrocería: el trazo más grueso. */
const silhouette = {
  fill: BODY,
  stroke: INK,
  strokeWidth: 1.7,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/** Cristales: tinte suave con borde medio. */
const glass = {
  fill: GLASS,
  stroke: MID,
  strokeWidth: 1,
  strokeLinejoin: "round" as const,
};

/** Piezas cerradas (faros, parrillas, placas): borde medio, fondo blanco. */
const piece = {
  fill: BODY,
  stroke: MID,
  strokeWidth: 1.1,
  strokeLinejoin: "round" as const,
};

/** Cortes de panel (puertas, capó, baúl): línea media sin relleno. */
const seam = {
  fill: "none",
  stroke: MID,
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
};

/** Creases de diseño y detalles ligeros. */
const crease = {
  fill: "none",
  stroke: SOFT,
  strokeWidth: 0.8,
  strokeLinecap: "round" as const,
};

/** Rueda de perfil a escala real: neumático, rin de 5 rayos y tapa. */
function SideWheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={31} fill={BODY} stroke={INK} strokeWidth={1.8} />
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={MID} strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={5.5} fill="none" stroke={MID} strokeWidth={1} />
      <g stroke={SOFT} strokeWidth={1}>
        <line x1={cx} y1={cy - 5.5} x2={cx} y2={cy - 18.5} />
        <line x1={cx + 5.2} y1={cy - 1.7} x2={cx + 17.6} y2={cy - 5.7} />
        <line x1={cx + 3.2} y1={cy + 4.4} x2={cx + 10.9} y2={cy + 15} />
        <line x1={cx - 3.2} y1={cy + 4.4} x2={cx - 10.9} y2={cy + 15} />
        <line x1={cx - 5.2} y1={cy - 1.7} x2={cx - 17.6} y2={cy - 5.7} />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Vista lateral (compartida por izquierda y derecha)                  */
/* ------------------------------------------------------------------ */

/**
 * Perfil a escala: nariz x=20, cola x=456, techo y=29, piso y=165.
 * Ejes en x=108 y x=364 (batalla real 2700 mm), rueda r=31 (Ø660 mm).
 * El rasgo clave del Civic sedán: una sola curva continua desde el capó
 * hasta el baúl corto y alto, con el cuarto de cristal afilado al pilar C.
 */
function SideViewBody() {
  return (
    <g>
      {/* Silueta de tres cajas (como el boceto): capó que baja a la nariz,
          parabrisas moderado, techo en domo, baúl corto y cola redondeada.
          Arcos de rueda recortados (r=36). */}
      <path
        d="M 24 116
           C 23 106 25 98 32 94
           C 68 90 110 86 150 83
           L 154 82
           C 172 66 192 48 214 39
           C 228 32 246 30 262 31
           C 280 32 294 36 304 42
           C 316 50 327 60 338 70
           C 348 76 360 78 374 79
           L 424 81
           C 436 82 444 85 449 90
           C 453 96 454 104 453 113
           C 452 124 450 134 446 141
           C 442 148 434 151 424 152
           L 400 153
           L 390.6 153
           A 36 36 0 1 0 329.4 153
           L 138.6 153
           A 36 36 0 1 0 77.4 153
           L 68 153
           C 50 152 34 148 28 140
           C 24 133 24 125 24 118 Z"
        {...silhouette}
      />

      {/* Cristales profundos con cinturón nivelado (base y=84) */}
      <path d="M 160 84 L 212 43 L 220 41 L 172 84 Z" {...glass} />
      <path d="M 178 84 L 220 45 C 232 39 246 37 258 37 L 260 84 C 233 85 205 85 178 84 Z" {...glass} />
      <path d="M 268 84 L 267 38 C 280 39 290 42 298 46 L 330 72 L 331 84 C 310 85 289 85 268 84 Z" {...glass} />

      {/* Cortes de panel: capó, guardabarros, puertas, cuarto y baúl */}
      <path d="M 150 85 C 118 88 88 91 64 93" {...seam} />
      <path d="M 174 87 C 172 109 170 131 168 151" {...seam} />
      <path d="M 264 86 L 262 152" {...seam} />
      <path d="M 333 86 C 333 92 333 97 333 102" {...seam} />
      <path d="M 340 73 C 342 81 343 88 344 95" {...seam} />
      <path d="M 424 81 C 427 92 429 102 430 112" {...seam} />

      {/* Línea de carácter del faro a la cola */}
      <path d="M 146 97 C 250 93 345 90 434 88" {...crease} />
      {/* Cejas de los arcos (doble línea del boceto) */}
      <path d="M 71.3 150 A 40 40 0 1 1 144.7 150" {...crease} />
      <path d="M 323.3 150 A 40 40 0 1 1 396.7 150" {...crease} />
      {/* Estribo en banda doble */}
      <path d="M 146 147 L 324 147" {...crease} />
      <path d="M 148 151 L 322 151" {...crease} />

      {/* Manijas justo bajo la base de las ventanas */}
      <rect x={234} y={89} width={18} height={5} rx={2.5} fill={BODY} stroke={MID} strokeWidth={1} />
      <rect x={302} y={89} width={18} height={5} rx={2.5} fill={BODY} stroke={MID} strokeWidth={1} />

      {/* Faro redondeado a media altura de la nariz */}
      <path d="M 26 106 C 27 100 33 96 42 96 C 51 96 58 99 61 103 C 62 107 59 110 53 112 L 34 113 C 28 112 25 111 26 106 Z" {...glass} />
      <path d="M 31 103 C 37 100 44 98 52 99" {...crease} />

      {/* Tapa de gasolina en el cuarto trasero */}
      <rect x={403} y={92} width={13} height={11} rx={2.5} fill={BODY} stroke={MID} strokeWidth={1} />

      {/* Calavera en la cola */}
      <path d="M 428 84 C 438 85 446 89 450 95 L 451 106 L 442 103 C 438 96 434 89 427 85 Z" {...glass} />
      <path d="M 433 90 C 438 95 442 100 445 105" {...crease} />

      {/* Bumper delantero: corte y toma de aire */}
      <path d="M 24 118 L 46 116" {...crease} />
      <rect x={27} y={127} width={19} height={10} rx={5} fill={BODY} stroke={MID} strokeWidth={1} />
      {/* Corte del bumper trasero */}
      <path d="M 452 124 L 432 123" {...crease} />
      {/* Mofle asomando bajo el bumper trasero */}
      <rect x={424} y={145} width={18} height={8} rx={4} fill={BODY} stroke={MID} strokeWidth={1.1} />

      {/* Espejo en la esquina del cinturón */}
      <path
        d="M 172 80 L 161 73 C 157 70 154 72 154 76 L 154 82 C 154 85 157 87 161 87 L 170 87 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1}
        strokeLinejoin="round"
      />

      {/* Ruedas a escala en los ejes reales */}
      <SideWheel cx={108} cy={134} />
      <SideWheel cx={360} cy={134} />
    </g>
  );
}

/** Vista lateral izquierda — frente del auto a la izquierda */
export function LeftSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <SideViewBody />
    </svg>
  );
}

/** Vista lateral derecha — espejo del perfil izquierdo */
export function RightSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <g transform="translate(480, 0) scale(-1, 1)">
        <SideViewBody />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Vista frontal — Civic 10ª gen                                       */
/* ------------------------------------------------------------------ */

export function FrontSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Franjas de neumático apenas visibles bajo el bumper */}
      <rect x={50} y={180} width={24} height={32} rx={4} fill={BODY} stroke={INK} strokeWidth={1.5} />
      <rect x={206} y={180} width={24} height={32} rx={4} fill={BODY} stroke={INK} strokeWidth={1.5} />

      {/* Carrocería: pilares rectos, esquinas firmes */}
      <path
        d="M 40 186
           C 38 170 36 152 35 140
           C 35 126 37 116 44 110
           L 58 104
           L 86 58
           C 90 52 97 49 107 48
           L 173 48
           C 183 49 190 52 194 58
           L 222 104
           L 236 110
           C 243 116 245 126 245 140
           C 244 152 242 170 240 186
           C 240 191 236 194 230 194
           L 50 194
           C 44 194 40 191 40 186 Z"
        {...silhouette}
      />

      {/* Parabrisas casi al borde del techo (banda fina) */}
      <path d="M 90 56 C 110 50 170 50 190 56 L 201 95 C 160 88 120 88 79 95 Z" {...glass} />
      <path d="M 86 93 C 106 89 124 88 140 88" {...crease} />
      <path d="M 148 88 C 164 88 182 89 199 93" {...crease} />

      {/* Borde del capó y creases en V */}
      <path d="M 79 97 C 120 91 160 91 201 97" {...crease} />
      <path d="M 66 104 C 90 108 104 114 114 121" {...crease} />
      <path d="M 214 104 C 190 108 176 114 166 121" {...crease} />

      {/* Barra + faros nivelados y esbeltos (sin caída) */}
      <path
        d="M 58 129 C 59 122 67 118 78 118 C 90 118 100 123 104 129 C 106 134 102 139 94 141 L 71 142 C 62 141 57 136 58 129 Z"
        {...glass}
      />
      <path
        d="M 222 129 C 221 122 213 118 202 118 C 190 118 180 123 176 129 C 174 134 178 139 186 141 L 209 142 C 218 141 223 136 222 129 Z"
        {...glass}
      />
      <path d="M 64 126 C 72 123 82 122 92 124" {...crease} />
      <path d="M 216 126 C 208 123 198 122 188 124" {...crease} />

      {/* Línea del bumper */}
      <path d="M 35 162 C 100 157 180 157 245 162" {...seam} />

      {/* Parrilla inferior trapezoidal */}
      <path
        d="M 116 120 L 164 120 C 170 120 173 123 173 129 L 173 134 C 173 140 170 143 164 143 L 116 143 C 110 143 107 140 107 134 L 107 129 C 107 123 110 120 116 120 Z"
        {...piece}
      />
      <path d="M 110 128 L 170 128" stroke={SOFT} strokeWidth={0.9} />
      <path d="M 110 136 L 170 136" stroke={SOFT} strokeWidth={0.9} />
      <circle cx={140} cy={131} r={5.5} fill={BODY} stroke={MID} strokeWidth={1} />

      {/* Placa */}
      <rect x={118} y={166} width={44} height={17} rx={2} fill={BODY} stroke={MID} strokeWidth={1.1} />

      {/* Bolsillos de neblineros angulares (sin círculos) */}
      <rect x={60} y={168} width={22} height={12} rx={6} fill={BODY} stroke={MID} strokeWidth={1} />
      <rect x={198} y={168} width={22} height={12} rx={6} fill={BODY} stroke={MID} strokeWidth={1} />

      {/* Labio inferior */}
      <path d="M 86 189 C 122 191 158 191 194 189" {...crease} />

      {/* Espejos compactos en la esquina del cinturón */}
      <path
        d="M 58 93 L 45 90 C 38 88 33 91 33 95 C 33 99 37 101 43 101 L 58 99 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path
        d="M 222 93 L 235 90 C 242 88 247 91 247 95 C 247 99 243 101 237 101 L 222 99 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Vista trasera — Civic 10ª gen (calaveras en C)                      */
/* ------------------------------------------------------------------ */

export function BackSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Franjas de neumático */}
      <rect x={50} y={180} width={24} height={32} rx={4} fill={BODY} stroke={INK} strokeWidth={1.5} />
      <rect x={206} y={180} width={24} height={32} rx={4} fill={BODY} stroke={INK} strokeWidth={1.5} />

      {/* Carrocería */}
      <path
        d="M 40 186
           C 38 170 36 152 35 140
           C 35 126 37 116 44 110
           L 58 104
           L 86 58
           C 90 52 97 49 107 48
           L 173 48
           C 183 49 190 52 194 58
           L 222 104
           L 236 110
           C 243 116 245 126 245 140
           C 244 152 242 170 240 186
           C 240 191 236 194 230 194
           L 50 194
           C 44 194 40 191 40 186 Z"
        {...silhouette}
      />

      {/* Cristal trasero */}
      <path d="M 90 56 C 110 51 170 51 190 56 L 199 92 C 160 86 120 86 81 92 Z" {...glass} />
      {/* Tercera luz de freno */}
      <rect x={126} y={52} width={28} height={4} rx={2} fill="none" stroke={MID} strokeWidth={1} />

      {/* Labio de spoiler del baúl */}
      <path d="M 68 99 C 118 92 162 92 212 99" {...crease} />

      {/* Calaveras en "C" esbeltas */}
      <path
        d="M 37 110 C 38 105 43 102 51 102 L 92 105 C 96 105 98 107 97 110 L 96 116 L 62 114 L 60 126 L 46 124 C 40 122 36 117 37 110 Z"
        {...glass}
      />
      <path
        d="M 243 110 C 242 105 237 102 229 102 L 188 105 C 184 105 182 107 183 110 L 184 116 L 218 114 L 220 126 L 234 124 C 240 122 244 117 243 110 Z"
        {...glass}
      />
      <path d="M 44 108 L 90 111" {...crease} />
      <path d="M 236 108 L 190 111" {...crease} />
      <path d="M 52 117 C 50 120 49 122 48 124" {...crease} />
      <path d="M 228 117 C 230 120 231 122 232 124" {...crease} />

      {/* Emblema y corte de la tapa */}
      <path d="M 96 140 C 125 138 155 138 184 140" {...seam} />

      {/* Receso y placa */}
      <rect x={104} y={103} width={72} height={28} rx={3} fill={BODY} stroke={SOFT} strokeWidth={0.9} />
      <rect x={112} y={108} width={56} height={18} rx={2} fill={BODY} stroke={MID} strokeWidth={1.1} />

      {/* Línea del bumper */}
      <path d="M 35 162 C 100 157 180 157 245 162" {...seam} />

      {/* Difusor */}
      <path
        d="M 74 170 C 122 166 158 166 206 170 L 204 186 C 158 190 122 190 76 186 Z"
        {...piece}
      />
      {/* Reflectores verticales */}
      <path d="M 54 166 L 60 166 L 59 181 L 53 180 Z" fill="none" stroke={SOFT} strokeWidth={0.9} />
      <path d="M 226 166 L 220 166 L 221 181 L 227 180 Z" fill="none" stroke={SOFT} strokeWidth={0.9} />
      {/* Mofle asomando bajo el bumper */}
      <rect x={180} y={188} width={19} height={8} rx={4} fill={BODY} stroke={MID} strokeWidth={1.1} />

      {/* Espejos compactos */}
      <path
        d="M 58 93 L 45 90 C 38 88 33 91 33 95 C 33 99 37 101 43 101 L 58 99 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path
        d="M 222 93 L 235 90 C 242 88 247 91 247 95 C 247 99 243 101 237 101 L 222 99 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Vista superior (frente a la izquierda)                              */
/* ------------------------------------------------------------------ */

export function TopSilhouette({ className, ...props }: SilhouetteProps) {
  return (
    <svg viewBox="0 0 480 170" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Espejos laterales */}
      <path
        d="M 170 12 L 162 4 C 161 1 164 0 168 1 L 182 6 C 185 8 184 11 181 12 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <path
        d="M 170 158 L 162 166 C 161 169 164 170 168 169 L 182 164 C 185 162 184 159 181 158 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1}
        strokeLinejoin="round"
      />

      {/* Carrocería (nariz a la izquierda, cola a la derecha) */}
      <path
        d="M 48 22
           C 40 26 33 36 29 50
           C 25 62 23 73 23 85
           C 23 97 25 108 29 120
           C 33 134 40 144 48 148
           C 62 155 88 159 120 160
           L 340 160
           C 392 159 426 154 439 147
           C 452 139 458 116 458 85
           C 458 54 452 31 439 23
           C 426 16 392 11 340 10
           L 120 10
           C 88 11 62 15 48 22 Z"
        {...silhouette}
      />

      {/* Corte del capó y contorno de la nariz */}
      <path d="M 149 12 C 145 60 145 110 149 158" {...seam} />
      <path d="M 54 34 C 96 26 124 24 146 23" {...crease} />
      <path d="M 54 136 C 96 144 124 146 146 147" {...crease} />
      {/* Nariz / parrilla */}
      <path d="M 26 62 C 24 70 23 78 23 85 C 23 92 24 100 26 108" {...crease} />

      {/* Parabrisas */}
      <path d="M 153 14 L 194 34 L 194 136 L 153 156 C 148 110 148 60 153 14 Z" {...glass} />

      {/* Techo */}
      <path
        d="M 194 34 L 294 32 C 298 60 298 110 294 138 L 194 136 C 191 110 191 60 194 34 Z"
        fill={BODY}
        stroke={MID}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />

      {/* Cristal trasero — caída fastback larga */}
      <path d="M 294 32 L 350 22 C 355 60 355 110 350 148 L 294 138 C 297 110 297 60 294 32 Z" {...glass} />

      {/* Baúl corto y labio de spoiler */}
      <path d="M 355 21 C 359 60 359 110 355 149" {...seam} />
      <path d="M 434 24 C 440 60 440 110 434 146" {...crease} />

      {/* Cortes de puertas */}
      <g fill="none" stroke={MID} strokeWidth={1}>
        <path d="M 199 10 L 197 34" />
        <path d="M 199 160 L 197 136" />
        <path d="M 254 10 L 254 33" />
        <path d="M 254 160 L 254 137" />
        <path d="M 308 10 L 306 32" />
        <path d="M 308 160 L 306 138" />
      </g>
      {/* Manijas */}
      <rect x={222} y={15} width={18} height={4} rx={2} fill={BODY} stroke={MID} strokeWidth={1} />
      <rect x={222} y={151} width={18} height={4} rx={2} fill={BODY} stroke={MID} strokeWidth={1} />
      <rect x={278} y={15} width={18} height={4} rx={2} fill={BODY} stroke={MID} strokeWidth={1} />
      <rect x={278} y={151} width={18} height={4} rx={2} fill={BODY} stroke={MID} strokeWidth={1} />
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
