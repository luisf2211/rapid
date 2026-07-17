/**
 * Mapa de zonas del vehículo para el marcado visual de daños en recepción.
 *
 * Módulo puro (sin "use client", sin JSX) para poder importarse tanto desde el
 * componente interactivo (cliente) como desde el documento de impresión (server).
 *
 * Cada zona tiene un número FIJO y global (1..N). Ese número es lo que se guarda
 * en la base de datos (`WorkOrderDamage.zoneNumber`). Las siluetas están divididas
 * en paneles numerados, igual que la hoja de papel del taller.
 *
 * La vista DERECHA se deriva de la IZQUIERDA por espejado programático de los
 * paths SVG: una sola fuente de verdad geométrica para ambos laterales.
 */

export type VehicleSide = "FRONT" | "BACK" | "LEFT" | "RIGHT" | "TOP";

export type ZoneShape =
  | { type: "rect"; x: number; y: number; w: number; h: number; rx?: number }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "path"; d: string };

export interface VehicleZone {
  /** Número fijo global que se persiste en BD. */
  zone: number;
  /** Nombre legible de la parte (se guarda también en PartName). */
  name: string;
  /** Nombre corto para chips en móvil. */
  short: string;
  side: VehicleSide;
  /** Área visible/pintable dentro del viewBox de su vista. */
  shape: ZoneShape;
  /** Área táctil ampliada (invisible) para zonas pequeñas en móvil. */
  hitShape?: ZoneShape;
  /** Posición del número dentro del viewBox. */
  labelX: number;
  labelY: number;
}

export interface ViewDef {
  side: VehicleSide;
  label: string;
  viewBox: { w: number; h: number };
  /** Ancho máximo sugerido en px para render en pantalla. */
  maxWidthClass: string;
  /** Trazos decorativos DEBAJO de las zonas (silueta, ruedas, espejos). */
  decor: ZoneShape[];
  /** Trazos decorativos ENCIMA de las zonas (manijas, aros, placa, parrilla). */
  overlay: ZoneShape[];
}

/* ------------------------------------------------------------------ */
/* Helpers de geometría (parser mínimo de paths absolutos M L H V Q C A Z) */
/* ------------------------------------------------------------------ */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parsePath(d: string): { cmd: string; args: number[] }[] {
  const re = /([MLHVQCAZ])([^MLHVQCAZ]*)/gi;
  const out: { cmd: string; args: number[] }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const args = (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number);
    out.push({ cmd: m[1].toUpperCase(), args });
  }
  return out;
}

/** Espeja horizontalmente un path SVG absoluto dentro de un ancho dado. */
function mirrorPathD(d: string, width: number): string {
  return parsePath(d)
    .map(({ cmd, args }) => {
      const a = [...args];
      if (cmd === "M" || cmd === "L" || cmd === "T" || cmd === "Q" || cmd === "C" || cmd === "S") {
        for (let i = 0; i < a.length; i += 2) a[i] = width - a[i];
      } else if (cmd === "H") {
        for (let i = 0; i < a.length; i++) a[i] = width - a[i];
      } else if (cmd === "A") {
        for (let i = 0; i < a.length; i += 7) {
          a[i + 4] = a[i + 4] ? 0 : 1; // invertir sweep flag
          a[i + 5] = width - a[i + 5];
        }
      }
      return a.length ? `${cmd} ${a.map(round2).join(" ")}` : cmd;
    })
    .join(" ");
}

function mirrorShape(shape: ZoneShape, width: number): ZoneShape {
  if (shape.type === "rect") return { ...shape, x: width - shape.x - shape.w };
  if (shape.type === "circle") return { ...shape, cx: width - shape.cx };
  return { type: "path", d: mirrorPathD(shape.d, width) };
}

/** Área aproximada (bounding box) para ordenar el render: grandes debajo. */
function shapeArea(shape: ZoneShape): number {
  if (shape.type === "rect") return shape.w * shape.h;
  if (shape.type === "circle") return Math.PI * shape.r * shape.r;
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  const addX = (x: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  };
  const addY = (y: number) => {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };
  for (const { cmd, args } of parsePath(shape.d)) {
    if (cmd === "M" || cmd === "L" || cmd === "T" || cmd === "Q" || cmd === "C" || cmd === "S") {
      for (let i = 0; i < args.length; i += 2) {
        addX(args[i]);
        addY(args[i + 1]);
      }
    } else if (cmd === "H") {
      args.forEach(addX);
    } else if (cmd === "V") {
      args.forEach(addY);
    } else if (cmd === "A") {
      for (let i = 0; i < args.length; i += 7) {
        addX(args[i + 5]);
        addY(args[i + 6]);
      }
    }
  }
  if (!Number.isFinite(minX)) return 0;
  return (maxX - minX) * (maxY - minY);
}

/* ------------------------------------------------------------------ */
/* FRONT — viewBox 200×140                                             */
/* ------------------------------------------------------------------ */

const FRONT_ZONES: VehicleZone[] = [
  {
    zone: 1,
    name: "Bumper delantero",
    short: "Bumper",
    side: "FRONT",
    shape: {
      type: "path",
      d: "M 26 94 H 174 Q 180 94 180 102 L 180 112 Q 180 121 170 121 H 30 Q 20 121 20 112 L 20 102 Q 20 94 26 94 Z",
    },
    labelX: 100,
    labelY: 101,
  },
  {
    zone: 2,
    name: "Parrilla",
    short: "Parrilla",
    side: "FRONT",
    shape: { type: "rect", x: 72, y: 68, w: 56, h: 22, rx: 6 },
    labelX: 100,
    labelY: 79,
  },
  {
    zone: 3,
    name: "Capó",
    short: "Capó",
    side: "FRONT",
    shape: {
      type: "path",
      d: "M 50 47 Q 100 41 150 47 L 156 64 Q 100 58 44 64 Z",
    },
    labelX: 100,
    labelY: 54,
  },
  {
    zone: 4,
    name: "Parabrisas",
    short: "Parabrisas",
    side: "FRONT",
    shape: {
      type: "path",
      d: "M 62 16 Q 100 11 138 16 L 149 44 Q 100 38 51 44 Z",
    },
    labelX: 100,
    labelY: 29,
  },
  {
    zone: 5,
    name: "Luz delantera izquierda",
    short: "Luz izq.",
    side: "FRONT",
    shape: {
      type: "path",
      d: "M 27 70 Q 27 67 31 67 L 64 69 Q 69 70 69 75 L 69 81 Q 69 85 64 85 L 31 83 Q 27 83 27 79 Z",
    },
    labelX: 47,
    labelY: 76,
  },
  {
    zone: 6,
    name: "Luz delantera derecha",
    short: "Luz der.",
    side: "FRONT",
    shape: {
      type: "path",
      d: "M 173 70 Q 173 67 169 67 L 136 69 Q 131 70 131 75 L 131 81 Q 131 85 136 85 L 169 83 Q 173 83 173 79 Z",
    },
    labelX: 153,
    labelY: 76,
  },
];

const FRONT_DECOR: ZoneShape[] = [
  // Silueta general
  {
    type: "path",
    d: "M 32 124 Q 20 124 20 110 L 20 78 Q 20 60 34 52 L 46 46 L 58 14 Q 61 9 68 9 H 132 Q 139 9 142 14 L 154 46 L 166 52 Q 180 60 180 78 L 180 110 Q 180 124 168 124 Z",
  },
  // Gomas asomando
  { type: "path", d: "M 34 124 V 128 Q 34 133 40 133 H 56 Q 62 133 62 128 V 124" },
  { type: "path", d: "M 166 124 V 128 Q 166 133 160 133 H 144 Q 138 133 138 128 V 124" },
  // Espejos
  { type: "rect", x: 6, y: 50, w: 14, h: 11, rx: 3 },
  { type: "rect", x: 180, y: 50, w: 14, h: 11, rx: 3 },
];

const FRONT_OVERLAY: ZoneShape[] = [
  // Toma de aire del bumper
  { type: "rect", x: 64, y: 106, w: 72, h: 9, rx: 4 },
  // Neblineros
  { type: "circle", cx: 42, cy: 110, r: 4 },
  { type: "circle", cx: 158, cy: 110, r: 4 },
  // Ranuras de la parrilla
  { type: "path", d: "M 78 84 H 122" },
];

/* ------------------------------------------------------------------ */
/* BACK — viewBox 200×140                                              */
/* ------------------------------------------------------------------ */

const BACK_ZONES: VehicleZone[] = [
  {
    zone: 7,
    name: "Bumper trasero",
    short: "Bumper",
    side: "BACK",
    shape: {
      type: "path",
      d: "M 26 94 H 174 Q 180 94 180 102 L 180 112 Q 180 121 170 121 H 30 Q 20 121 20 112 L 20 102 Q 20 94 26 94 Z",
    },
    labelX: 100,
    labelY: 107,
  },
  {
    zone: 8,
    name: "Baúl / portón",
    short: "Baúl",
    side: "BACK",
    shape: {
      type: "path",
      d: "M 50 47 Q 100 41 150 47 L 155 68 L 126 68 L 126 88 Q 100 92 74 88 L 74 68 L 45 68 Z",
    },
    labelX: 100,
    labelY: 58,
  },
  {
    zone: 9,
    name: "Cristal trasero",
    short: "Cristal",
    side: "BACK",
    shape: {
      type: "path",
      d: "M 62 16 Q 100 11 138 16 L 149 44 Q 100 38 51 44 Z",
    },
    labelX: 100,
    labelY: 29,
  },
  {
    zone: 10,
    name: "Luz trasera izquierda",
    short: "Luz izq.",
    side: "BACK",
    shape: {
      type: "path",
      d: "M 27 70 Q 27 67 31 67 L 70 69 V 84 L 31 83 Q 27 83 27 79 Z",
    },
    labelX: 48,
    labelY: 75,
  },
  {
    zone: 11,
    name: "Luz trasera derecha",
    short: "Luz der.",
    side: "BACK",
    shape: {
      type: "path",
      d: "M 173 70 Q 173 67 169 67 L 130 69 V 84 L 169 83 Q 173 83 173 79 Z",
    },
    labelX: 152,
    labelY: 75,
  },
];

const BACK_DECOR: ZoneShape[] = FRONT_DECOR;

const BACK_OVERLAY: ZoneShape[] = [
  // Placa
  { type: "rect", x: 84, y: 72, w: 32, h: 13, rx: 2 },
  // Reflectores del bumper
  { type: "rect", x: 34, y: 108, w: 14, h: 5, rx: 2 },
  { type: "rect", x: 152, y: 108, w: 14, h: 5, rx: 2 },
];

/* ------------------------------------------------------------------ */
/* LEFT — viewBox 320×140 (frente del auto hacia la izquierda)         */
/* RIGHT se deriva por espejado programático.                          */
/* ------------------------------------------------------------------ */

const SIDE_W = 320;

const LEFT_ZONES: VehicleZone[] = [
  {
    zone: 12,
    name: "Guardabarros delantero izquierdo",
    short: "Guardab. del.",
    side: "LEFT",
    shape: {
      type: "path",
      d: "M 10 88 V 72 Q 10 62 22 60 L 96 55 L 108 58 V 98 H 107 A 25 25 0 0 0 57 98 H 14 Q 10 98 10 88 Z",
    },
    labelX: 33,
    labelY: 78,
  },
  {
    zone: 13,
    name: "Puerta delantera izquierda",
    short: "Puerta del.",
    side: "LEFT",
    shape: { type: "path", d: "M 108 58 L 168 57 V 98 H 108 Z" },
    labelX: 138,
    labelY: 78,
  },
  {
    zone: 14,
    name: "Puerta trasera izquierda",
    short: "Puerta tras.",
    side: "LEFT",
    shape: {
      type: "path",
      d: "M 168 57 L 224 58 V 82 Q 224 91 221 98 H 168 Z",
    },
    labelX: 194,
    labelY: 78,
  },
  {
    zone: 15,
    name: "Guardabarros trasero izquierdo",
    short: "Guardab. tras.",
    side: "LEFT",
    shape: {
      type: "path",
      d: "M 224 58 L 250 55 L 292 60 Q 310 62 310 76 V 88 Q 310 98 298 98 H 271 A 25 25 0 0 0 221 98 Q 224 91 224 82 Z",
    },
    labelX: 288,
    labelY: 76,
  },
  {
    zone: 16,
    name: "Estribo izquierdo",
    short: "Estribo",
    side: "LEFT",
    shape: { type: "rect", x: 108, y: 100, w: 112, h: 8, rx: 2 },
    hitShape: { type: "rect", x: 108, y: 99, w: 112, h: 15 },
    labelX: 164,
    labelY: 104,
  },
  {
    zone: 17,
    name: "Espejo izquierdo",
    short: "Espejo",
    side: "LEFT",
    shape: {
      type: "path",
      d: "M 96 44 Q 96 41 100 41 L 112 42 V 51 L 100 50 Q 96 50 96 47 Z",
    },
    hitShape: { type: "rect", x: 90, y: 35, w: 28, h: 22 },
    labelX: 104,
    labelY: 46,
  },
  {
    zone: 18,
    name: "Cristales laterales izquierdos",
    short: "Cristales",
    side: "LEFT",
    shape: {
      type: "path",
      d: "M 112 55 L 134 35 Q 137 32 143 32 H 204 Q 210 32 213 35 L 236 54 L 232 56 L 112 57 Z",
    },
    labelX: 152,
    labelY: 45,
  },
  {
    zone: 19,
    name: "Rueda delantera izquierda",
    short: "Rueda del.",
    side: "LEFT",
    shape: { type: "circle", cx: 82, cy: 106, r: 18 },
    hitShape: { type: "circle", cx: 82, cy: 106, r: 24 },
    labelX: 82,
    labelY: 106,
  },
  {
    zone: 20,
    name: "Rueda trasera izquierda",
    short: "Rueda tras.",
    side: "LEFT",
    shape: { type: "circle", cx: 246, cy: 106, r: 18 },
    hitShape: { type: "circle", cx: 246, cy: 106, r: 24 },
    labelX: 246,
    labelY: 106,
  },
];

const LEFT_DECOR: ZoneShape[] = [
  // Línea de techo sobre los cristales
  {
    type: "path",
    d: "M 106 55 L 131 32 Q 135 28 143 28 H 205 Q 212 28 216 32 L 240 53",
  },
  // Detalle del frente (luz)
  { type: "path", d: "M 12 62 L 26 60" },
];

const LEFT_OVERLAY: ZoneShape[] = [
  // Manijas de puertas
  { type: "rect", x: 150, y: 63, w: 12, h: 3, rx: 1.5 },
  { type: "rect", x: 206, y: 63, w: 12, h: 3, rx: 1.5 },
  // Pilar B
  { type: "path", d: "M 170 33 V 55" },
  // Aros
  { type: "circle", cx: 82, cy: 106, r: 8 },
  { type: "circle", cx: 246, cy: 106, r: 8 },
];

/** Mapeo LEFT → RIGHT: mismo orden, números y nombres del lado derecho. */
const RIGHT_FROM_LEFT: Record<number, { zone: number; name: string }> = {
  12: { zone: 21, name: "Guardabarros delantero derecho" },
  13: { zone: 22, name: "Puerta delantera derecha" },
  14: { zone: 23, name: "Puerta trasera derecha" },
  15: { zone: 24, name: "Guardabarros trasero derecho" },
  16: { zone: 25, name: "Estribo derecho" },
  17: { zone: 26, name: "Espejo derecho" },
  18: { zone: 27, name: "Cristales laterales derechos" },
  19: { zone: 28, name: "Rueda delantera derecha" },
  20: { zone: 29, name: "Rueda trasera derecha" },
};

const RIGHT_ZONES: VehicleZone[] = LEFT_ZONES.map((z) => {
  const target = RIGHT_FROM_LEFT[z.zone];
  return {
    ...z,
    zone: target.zone,
    name: target.name,
    side: "RIGHT" as const,
    shape: mirrorShape(z.shape, SIDE_W),
    hitShape: z.hitShape ? mirrorShape(z.hitShape, SIDE_W) : undefined,
    labelX: SIDE_W - z.labelX,
  };
});

/* ------------------------------------------------------------------ */
/* TOP — viewBox 160×300 (frente arriba)                               */
/* ------------------------------------------------------------------ */

const TOP_ZONES: VehicleZone[] = [
  {
    zone: 30,
    name: "Capó (vista superior)",
    short: "Capó",
    side: "TOP",
    shape: {
      type: "path",
      d: "M 36 24 Q 80 16 124 24 Q 132 36 132 62 Q 132 82 128 88 Q 80 80 32 88 Q 28 82 28 62 Q 28 36 36 24 Z",
    },
    labelX: 80,
    labelY: 54,
  },
  {
    zone: 31,
    name: "Techo",
    short: "Techo",
    side: "TOP",
    shape: { type: "rect", x: 36, y: 122, w: 88, h: 72, rx: 10 },
    labelX: 80,
    labelY: 158,
  },
  {
    zone: 32,
    name: "Tapa de baúl (vista superior)",
    short: "Baúl",
    side: "TOP",
    shape: {
      type: "path",
      d: "M 32 226 Q 80 218 128 226 Q 132 232 132 252 Q 132 276 124 280 Q 80 288 36 280 Q 28 276 28 252 Q 28 232 32 226 Z",
    },
    labelX: 80,
    labelY: 254,
  },
];

const TOP_DECOR: ZoneShape[] = [
  // Contorno del vehículo visto desde arriba
  {
    type: "path",
    d: "M 34 18 Q 80 10 126 18 Q 138 30 138 64 V 238 Q 138 272 128 282 Q 80 292 32 282 Q 22 272 22 238 V 64 Q 22 30 34 18 Z",
  },
  // Banda del parabrisas
  { type: "path", d: "M 32 92 Q 80 84 128 92 L 122 118 Q 80 108 38 118 Z" },
  // Banda del cristal trasero
  { type: "path", d: "M 38 198 Q 80 208 122 198 L 128 224 Q 80 216 32 224 Z" },
  // Espejos
  { type: "rect", x: 8, y: 108, w: 16, h: 20, rx: 5 },
  { type: "rect", x: 136, y: 108, w: 16, h: 20, rx: 5 },
];

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

/** Orden de las vistas tal como se presentan al usuario y en la impresión. */
export const ORDERED_SIDES: VehicleSide[] = [
  "FRONT",
  "BACK",
  "LEFT",
  "RIGHT",
  "TOP",
];

export const VIEW_DEFS: Record<VehicleSide, ViewDef> = {
  FRONT: {
    side: "FRONT",
    label: "Frente",
    viewBox: { w: 200, h: 140 },
    maxWidthClass: "max-w-sm",
    decor: FRONT_DECOR,
    overlay: FRONT_OVERLAY,
  },
  BACK: {
    side: "BACK",
    label: "Atrás",
    viewBox: { w: 200, h: 140 },
    maxWidthClass: "max-w-sm",
    decor: BACK_DECOR,
    overlay: BACK_OVERLAY,
  },
  LEFT: {
    side: "LEFT",
    label: "Izquierda",
    viewBox: { w: 320, h: 140 },
    maxWidthClass: "max-w-2xl",
    decor: LEFT_DECOR,
    overlay: LEFT_OVERLAY,
  },
  RIGHT: {
    side: "RIGHT",
    label: "Derecha",
    viewBox: { w: 320, h: 140 },
    maxWidthClass: "max-w-2xl",
    decor: LEFT_DECOR.map((s) => mirrorShape(s, SIDE_W)),
    overlay: LEFT_OVERLAY.map((s) => mirrorShape(s, SIDE_W)),
  },
  TOP: {
    side: "TOP",
    label: "Techo",
    viewBox: { w: 160, h: 300 },
    maxWidthClass: "max-w-[220px]",
    decor: TOP_DECOR,
    overlay: [],
  },
};

export const VEHICLE_ZONES: VehicleZone[] = [
  ...FRONT_ZONES,
  ...BACK_ZONES,
  ...LEFT_ZONES,
  ...RIGHT_ZONES,
  ...TOP_ZONES,
];

export const VEHICLE_ZONE_MAP: Record<number, VehicleZone> = Object.fromEntries(
  VEHICLE_ZONES.map((z) => [z.zone, z]),
);

export function getZonesBySide(side: VehicleSide): VehicleZone[] {
  return VEHICLE_ZONES.filter((z) => z.side === side);
}

/**
 * Zonas de una vista ordenadas por área descendente para el render SVG:
 * las zonas grandes se dibujan primero y las pequeñas (espejo, luces, ruedas)
 * encima, evitando que queden ocultas y quedando accesibles al toque.
 */
export function getZonesForRender(side: VehicleSide): VehicleZone[] {
  return getZonesBySide(side)
    .slice()
    .sort((a, b) => shapeArea(b.shape) - shapeArea(a.shape));
}

/** Nombre de la parte a partir del número de zona (para BD / impresión). */
export function zoneName(zone: number | null | undefined): string | null {
  if (zone == null) return null;
  return VEHICLE_ZONE_MAP[zone]?.name ?? null;
}
