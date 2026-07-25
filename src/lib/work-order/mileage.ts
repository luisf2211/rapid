export type MileageUnit = "mi" | "km";

export const MILEAGE_UNITS: { value: MileageUnit; label: string }[] = [
  { value: "mi", label: "mi" },
  { value: "km", label: "km" },
];

/** Órdenes viejas guardaban la unidad dentro del texto del millaje ("120,000 mi"). */
const TRAILING_UNIT = /[\s.]*(millas|kms?|kil[oó]metros|mi)\.?$/i;

function detectUnit(raw: string): MileageUnit | null {
  const match = raw.match(TRAILING_UNIT);
  if (!match) return null;
  return /^k/i.test(match[1]) ? "km" : "mi";
}

export function normalizeMileageUnit(value: unknown): MileageUnit | null {
  return value === "mi" || value === "km" ? value : null;
}

/** Separa el número de la unidad, tomando la columna si existe y si no el sufijo del texto. */
export function parseMileage(
  raw: string | null | undefined,
  storedUnit?: string | null,
): { value: string; unit: MileageUnit | null } {
  const text = (raw ?? "").trim();
  const unit = normalizeMileageUnit(storedUnit) ?? detectUnit(text);
  return { value: text.replace(TRAILING_UNIT, "").trim(), unit };
}

/** Texto para mostrar: agrega la unidad solo cuando se conoce. */
export function formatMileage(
  raw: string | null | undefined,
  storedUnit?: string | null,
): string | null {
  const { value, unit } = parseMileage(raw, storedUnit);
  if (!value) return null;
  return unit ? `${value} ${unit}` : value;
}

/** Valor a persistir en la columna Mileage: sin la unidad, que viaja aparte. */
export function mileageValueToStore(raw: string | null | undefined): string | null {
  return parseMileage(raw).value || null;
}
