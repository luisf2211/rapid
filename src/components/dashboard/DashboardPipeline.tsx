import Link from "next/link";
import { WORK_ORDER_STATUS_LABELS } from "@/lib/constants";

type Stage = {
  key: string;
  label: string;
  count: number;
  href: string;
  color: string;
  dotColor: string;
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
      dotColor: "bg-emerald-500",
    },
    {
      key: "IN_PROGRESS",
      label: WORK_ORDER_STATUS_LABELS.IN_PROGRESS,
      count: inProgress,
      href: "/work-orders?status=IN_PROGRESS",
      color: "bg-amber-400",
      dotColor: "bg-amber-500",
    },
    {
      key: "COMPLETED",
      label: WORK_ORDER_STATUS_LABELS.COMPLETED,
      count: completed,
      href: "/work-orders?status=COMPLETED",
      color: "bg-blue-500",
      dotColor: "bg-blue-500",
    },
    {
      key: "DELIVERED",
      label: WORK_ORDER_STATUS_LABELS.DELIVERED,
      count: delivered,
      href: "/work-orders?status=DELIVERED",
      color: "bg-violet-500",
      dotColor: "bg-violet-500",
    },
  ];

  const sum = stages.reduce((s, st) => s + st.count, 0);
  const total = sum || 1;

  return (
    <section className="card p-5 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-rapid-text">Pipeline del taller</h2>
        <Link
          href="/work-orders"
          className="text-xs font-medium text-rapid-text-muted hover:text-rapid-text transition-colors"
        >
          Ver órdenes →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-rapid-surface-strong gap-px">
        {sum === 0 ? (
          <div className="flex-1 bg-rapid-border rounded-full" />
        ) : (
          stages.map((st) => {
            const pct = (st.count / total) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={st.key}
                className={`${st.color} min-w-[3px] transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${st.label}: ${st.count}`}
              />
            );
          })
        )}
      </div>

      {/* Stage cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {stages.map((st) => (
          <Link
            key={st.key}
            href={st.href}
            className="group rounded-lg border border-rapid-border p-3 hover:border-rapid-border-strong hover:shadow-[var(--shadow-sm)] transition-all duration-150"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
              <span className="text-[11px] font-medium text-rapid-text-muted group-hover:text-rapid-text transition-colors">
                {st.label}
              </span>
            </div>
            <p className="text-xl font-semibold tabular-nums text-rapid-text">
              {st.count}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
