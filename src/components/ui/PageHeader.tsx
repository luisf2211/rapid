import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="text-[11px] uppercase tracking-[0.05em] font-semibold text-rapid-text-muted mb-1.5">
            {breadcrumb}
          </p>
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <h1 className="text-[22px] sm:text-[28px] font-bold text-rapid-text tracking-tight leading-[1.2]">
              {title}
            </h1>
            {badge}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-rapid-text-muted mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
