import { WORKSHOP_TIMEZONE } from "@/lib/formatters/today";

function workshopHour(now: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: WORKSHOP_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(now);
  return Number(hour);
}

export function dashboardGreeting(now: Date = new Date()): string {
  const hour = workshopHour(now);
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function dashboardDateLabel(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-DO", {
    timeZone: WORKSHOP_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
}
