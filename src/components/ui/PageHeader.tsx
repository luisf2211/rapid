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
      {breadcrumb && (
        <div className="mb-2">
          {breadcrumb}
        </div>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-rapid-text tracking-[-0.02em] leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-rapid-text-muted mt-1 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
