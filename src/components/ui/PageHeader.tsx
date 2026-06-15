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
    <header className="mb-6 space-y-4">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-rapid-text-muted mb-1.5">
            {breadcrumb}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-rapid-text tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-rapid-text-muted mt-1.5 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {actions}
        </div>
      )}
    </header>
  );
}
