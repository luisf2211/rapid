import Link from "next/link";
import { WORK_ORDER_STATUS_LABELS } from "@/lib/constants";

type Stage = {
  key: string;
  label: string;
  count: number;
  href: string;
  color: string;
};

export function DashboardPipeline({
  received,
  inProgress,
  completed,
  delivered,
}: {
  received: number;
  inProgress: number;
  completed: number;
  delivered: number;
}) {
  const stages: Stage[] = [
    {
      key: "RECEIVED",
      label: WORK_ORDER_STATUS_LABELS.RECEIVED,
      count: received,
      href: "/work-orders?status=RECEIVED",
      color: "bg-emerald-500",
    },
    {
      key: "IN_PROGRESS",
      label: WORK_ORDER_STATUS_LABELS.IN_PROGRESS,
      count: inProgress,
      href: "/work-orders?status=IN_PROGRESS",
      color: "bg-amber-400",
    },
    {
      key: "COMPLETED",
      label: WORK_ORDER_STATUS_LABELS.COMPLETED,
      count: completed,
      href: "/work-orders?status=COMPLETED",
      color: "bg-sky-500",
    },
    {
      key: "DELIVERED",
      label: WORK_ORDER_STATUS_LABELS.DELIVERED,
      count: delivered,
      href: "/work-orders?status=DELIVERED",
      color: "bg-violet-500",
    },
  ];

  const sum = stages.reduce((s, st) => s + st.count, 0);
  const total = sum || 1;

  return (
    <section className="card p-5 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-rapid-text">En el taller</h2>
        <Link
          href="/work-orders"
          className="text-sm font-medium text-rapid-text-muted hover:text-rapid-text transition"
        >
          Ver órdenes
        </Link>
      </div>

      <div className="flex h-2.5 rounded-full overflow-hidden bg-rapid-bg gap-px">
        {sum === 0 ? (
          <div className="flex-1 bg-rapid-border rounded-full" />
        ) : (
          stages.map((st) => {
            const pct = (st.count / total) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={st.key}
                className={`${st.color} min-w-[4px] transition-all`}
                style={{ width: `${pct}%` }}
                title={`${st.label}: ${st.count}`}
              />
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {stages.map((st) => (
          <Link
            key={st.key}
            href={st.href}
            className="group rounded-xl border border-rapid-border p-3 hover:border-rapid-text/20 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${st.color}`} />
              <span className="text-xs font-medium text-rapid-text-muted group-hover:text-rapid-text">
                {st.label}
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums mt-2 text-rapid-text">
              {st.count}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
