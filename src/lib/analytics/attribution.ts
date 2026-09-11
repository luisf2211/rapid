/**
 * Atribución first-touch: captura la primera fuente del visitante
 * (UTM + referrer) y la persiste en una cookie para asociarla luego a
 * una solicitud de cotización o registro de taller.
 */

export const ATTRIBUTION_COOKIE = "rapid_attr";
const MAX_AGE_DAYS = 90;

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landing?: string;
  ts?: string;
};

const UTM_KEYS: Record<string, keyof Attribution> = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_content: "content",
  utm_term: "term",
};

/** Extrae atribución desde una query string (window.location.search). */
export function parseAttributionFromSearch(
  search: string,
  referrer: string,
  landing: string,
): Attribution | null {
  const params = new URLSearchParams(search);
  const attr: Attribution = {};
  let hasUtm = false;

  for (const [param, key] of Object.entries(UTM_KEYS)) {
    const v = params.get(param);
    if (v) {
      attr[key] = v.slice(0, 120);
      hasUtm = true;
    }
  }

  // Si no hay UTM pero viene de un referrer externo, lo registramos igual.
  const externalRef =
    referrer && !referrer.includes(location.hostname) ? referrer : "";

  if (!hasUtm && !externalRef) return null;

  attr.referrer = (externalRef || referrer || "").slice(0, 200);
  attr.landing = landing.slice(0, 200);
  attr.ts = new Date().toISOString();
  return attr;
}

/** Lee la cookie de atribución (cliente). */
export function readAttributionCookie(): Attribution | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return null;
  }
}

/** Escribe la cookie de atribución solo si aún no existe (first-touch). */
export function persistFirstTouch(attr: Attribution): void {
  if (typeof document === "undefined") return;
  if (readAttributionCookie()) return; // ya hay first-touch, no sobrescribir
  const value = encodeURIComponent(JSON.stringify(attr));
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${ATTRIBUTION_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
