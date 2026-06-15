/** Zona horaria del taller (República Dominicana). */
export const WORKSHOP_TIMEZONE = "America/Santo_Domingo";

/** Fecha de hoy para `<input type="date">` (YYYY-MM-DD) en zona del taller. */
export function getWorkshopTodayDateInput(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WORKSHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
