const SPANISH_NUMBERS: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
};

/** Denominador por palabra (medio = 1/2, octavo = 1/8, etc.). */
const SPANISH_FRACTIONS: Record<string, number> = {
  medio: 2,
  media: 2,
  mitad: 2,
  tercio: 3,
  tercios: 3,
  cuarto: 4,
  cuartos: 4,
  quinto: 5,
  quintos: 5,
  sexto: 6,
  sextos: 6,
  septimo: 7,
  septimos: 7,
  octavo: 8,
  octavos: 8,
  noveno: 9,
  novenos: 9,
  decimo: 10,
  decimos: 10,
};

function normalizeQuantityText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

function roundQuantity(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Convierte texto a cantidad numérica.
 * Acepta: 0.125, 1/8, 1 octavo, 2 octavos, 1 1/2, etc.
 */
export function parseFractionQuantity(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? roundQuantity(value) : null;
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const s = normalizeQuantityText(raw);

  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const num = Number(mixed[2]);
    const den = Number(mixed[3]);
    if (den > 0) return roundQuantity(whole + num / den);
    return null;
  }

  const slash = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (slash) {
    const num = Number(slash[1]);
    const den = Number(slash[2]);
    if (den > 0) return roundQuantity(num / den);
    return null;
  }

  const spanish = s.match(
    /^(?:(un|una|uno|\d+)\s+)?(medio|media|mitad|tercio|tercios|cuarto|cuartos|quinto|quintos|sexto|sextos|septimo|septimos|octavo|octavos|noveno|novenos|decimo|decimos)$/,
  );
  if (spanish) {
    const wholeToken = spanish[1];
    const fractionWord = spanish[2];
    const den = SPANISH_FRACTIONS[fractionWord];
    if (!den) return null;
    let numerator = 1;
    if (wholeToken) {
      numerator =
        SPANISH_NUMBERS[wholeToken] ?? Number.parseInt(wholeToken, 10);
      if (!Number.isFinite(numerator) || numerator <= 0) return null;
    }
    return roundQuantity(numerator / den);
  }

  const decimal = Number.parseFloat(s.replace(",", "."));
  if (Number.isFinite(decimal)) return roundQuantity(decimal);

  return null;
}

const COMMON_DENOMINATORS = [2, 3, 4, 5, 6, 8, 10, 12, 16];

/** Muestra cantidades como fracción cuando aplica (0.125 → 1/8). */
export function formatFractionQuantity(value: unknown): string {
  const n = typeof value === "number" ? value : parseFractionQuantity(value);
  if (n == null || !Number.isFinite(n)) return "—";

  if (Math.abs(n - Math.round(n)) < 0.0001) {
    return String(Math.round(n));
  }

  const whole = Math.floor(n + 0.0001);
  const fractionPart = n - whole;

  for (const den of COMMON_DENOMINATORS) {
    const num = Math.round(fractionPart * den);
    if (num > 0 && Math.abs(num / den - fractionPart) < 0.001) {
      const fraction = `${num}/${den}`;
      return whole > 0 ? `${whole} ${fraction}` : fraction;
    }
  }

  const trimmed = n.toFixed(4).replace(/\.?0+$/, "");
  return trimmed;
}
