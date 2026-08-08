"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive, sidebarNavGroups, type NavGroup } from "./nav-config";
import { useSidebar } from "./SidebarContext";

export function SidebarNav({ stockAlertCount = 0 }: { stockAlertCount?: number }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  // Auto-expand the group that contains the active route
  const activeGroupLabels = sidebarNavGroups
    .filter((g) => g.items.some((item) => isNavActive(pathname, item.href)))
    .map((g) => g.label);

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(activeGroupLabels.length > 0 ? activeGroupLabels : [sidebarNavGroups[0]?.label]),
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <nav className={cn("py-3 space-y-0.5", collapsed ? "px-2" : "px-3")}>
      {sidebarNavGroups.map((group) => (
        <SidebarGroup
          key={group.label}
          group={group}
          isOpen={openGroups.has(group.label)}
          onToggle={() => toggleGroup(group.label)}
          pathname={pathname}
          collapsed={collapsed}
          stockAlertCount={stockAlertCount}
        />
      ))}
    </nav>
  );
}

function SidebarGroup({
  group,
  isOpen,
  onToggle,
  pathname,
  collapsed,
  stockAlertCount,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  collapsed: boolean;
  stockAlertCount: number;
}) {
  if (collapsed) {
    return (
      <div className="space-y-0.5 mb-2">
        {group.items.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          const showBadge = item.stockAlerts && stockAlertCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "group relative flex items-center justify-center rounded-lg p-2 transition-all duration-150",
                active
                  ? "bg-rapid-green-soft text-rapid-green-dark"
                  : "text-rapid-text-muted hover:bg-rapid-surface-strong hover:text-rapid-text",
              )}
            >
              <span className="relative">
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.75} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  const hasActiveItem = group.items.some((item) => isNavActive(pathname, item.href));

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-[0.04em] transition-colors",
          hasActiveItem
            ? "text-rapid-text-muted"
            : "text-rapid-text-muted-soft hover:text-rapid-text-muted",
        )}
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="space-y-0.5 pt-0.5 pb-1">
          {group.items.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            const showBadge = item.stockAlerts && stockAlertCount > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150",
                    active
                      ? "bg-rapid-green-soft text-rapid-green-dark"
                      : "text-rapid-text-muted hover:bg-rapid-surface-strong hover:text-rapid-text",
                  )}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  <span className="truncate flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="shrink-0 min-h-[18px] min-w-[18px] px-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center">
                      {stockAlertCount > 99 ? "99+" : stockAlertCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
