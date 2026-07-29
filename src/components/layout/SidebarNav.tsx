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
    <nav className={cn("py-4 space-y-1", collapsed ? "px-2" : "px-3")}>
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
  // When collapsed, show all items without accordion
  if (collapsed) {
    return (
      <div className="space-y-1">
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
                "group relative flex items-center justify-center rounded-xl p-2 transition-all duration-150",
                active
                  ? "bg-rapid-green/15 text-white shadow-[inset_0_0_0_1px_rgba(0,200,83,0.25)]"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
              )}
            >
              <span
                className={cn(
                  "relative flex shrink-0 items-center justify-center rounded-lg h-9 w-9 transition-colors",
                  active
                    ? "bg-rapid-green text-rapid-black"
                    : "bg-white/[0.06] text-white/50 group-hover:bg-white/10 group-hover:text-white/80",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#0c100f]" />
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
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors",
          hasActiveItem
            ? "text-white/60"
            : "text-white/35 hover:text-white/50",
        )}
      >
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="space-y-1 pt-1 pb-2">
          {group.items.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            const showBadge = item.stockAlerts && stockAlertCount > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                    active
                      ? "bg-rapid-green/15 text-white shadow-[inset_0_0_0_1px_rgba(0,200,83,0.25)]"
                      : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
                  )}
                >
                  <span
                    className={cn(
                      "relative flex shrink-0 items-center justify-center rounded-lg h-8 w-8 transition-colors",
                      active
                        ? "bg-rapid-green text-rapid-black"
                        : "bg-white/[0.06] text-white/50 group-hover:bg-white/10 group-hover:text-white/80",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  <span className="truncate flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="shrink-0 min-h-5 min-w-5 px-1.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center justify-center">
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
