/**
 * Convierte valores de Prisma (Decimal, Date, etc.) a tipos serializables
 * para pasar de Server Components a Client Components.
 */

export function toPlainNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function toPlainDateString(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** Recorre un objeto y convierte Decimal/Date anidados (un nivel de profundidad controlado). */
export function deepPlain<T>(value: T): T {
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((item) => deepPlain(item)) as T;
  }
  if (value instanceof Date) {
    return value.toISOString() as T;
  }
  if (
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber() as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepPlain(v);
    }
    return out as T;
  }
  return value;
}
