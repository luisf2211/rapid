/**
 * Capa de tracking de eventos. Envía a GA4 (gtag) si está configurado.
 * Segura de llamar aunque GA4 no esté cargado (no-op).
 */

export type AnalyticsEvent =
  // B2C
  | "quote_landing_view"
  | "quote_started"
  | "vehicle_selected"
  | "photos_uploaded"
  | "quote_submitted"
  // B2B
  | "workshop_landing_view"
  | "workshop_registration_started"
  | "workshop_registration_completed"
  | "directory_view"
  | "workshop_profile_view";

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};

/** Registra un evento de analytics (client-side). No-op si GA4 no está activo. */
export function track(
  event: AnalyticsEvent,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined") return;
  const w = window as GtagWindow;
  if (typeof w.gtag !== "function") return;
  w.gtag("event", event, params ?? {});
}

export function getGaId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_ID || undefined;
}
