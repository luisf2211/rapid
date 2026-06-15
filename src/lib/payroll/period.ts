/** Quincena: 1–15 y 16–último día del mes. */
export function getQuincenaForDate(date: Date = new Date()): {
  periodStart: Date;
  periodEnd: Date;
  label: string;
} {
  const y = date.getFullYear();
  const m = date.getMonth();
  const day = date.getDate();
  const lastDay = new Date(y, m + 1, 0).getDate();

  if (day <= 15) {
    return {
      periodStart: new Date(y, m, 1),
      periodEnd: new Date(y, m, 15),
      label: `1–15 ${formatMonthYear(y, m)}`,
    };
  }

  return {
    periodStart: new Date(y, m, 16),
    periodEnd: new Date(y, m, lastDay),
    label: `16–${lastDay} ${formatMonthYear(y, m)}`,
  };
}

function formatMonthYear(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleDateString("es-DO", {
    month: "long",
    year: "numeric",
  });
}

export function formatPeriodRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return `${start.toLocaleDateString("es-DO", opts)} – ${end.toLocaleDateString("es-DO", opts)}`;
}

/** Normaliza fecha a medianoche local para comparar con @db.Date. */
export function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
