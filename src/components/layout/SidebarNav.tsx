"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavActive, sidebarNavGroups } from "./nav-config";
import { useSidebar } from "./SidebarContext";

export function SidebarNav({ stockAlertCount = 0 }: { stockAlertCount?: number }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <nav className={cn("py-4 space-y-6", collapsed ? "px-2" : "px-3")}>
      {sidebarNavGroups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              {group.label}
            </p>
          )}
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              const showBadge = item.stockAlerts && stockAlertCount > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-150",
                      collapsed
                        ? "justify-center p-2"
                        : "gap-3 px-3 py-2.5",
                      active
                        ? "bg-rapid-green/15 text-white shadow-[inset_0_0_0_1px_rgba(0,200,83,0.25)]"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
                    )}
                  >
                    <span
                      className={cn(
                        "relative flex shrink-0 items-center justify-center rounded-lg transition-colors",
                        collapsed ? "h-9 w-9" : "h-8 w-8",
                        active
                          ? "bg-rapid-green text-rapid-black"
                          : "bg-white/[0.06] text-white/50 group-hover:bg-white/10 group-hover:text-white/80",
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.25} />
                      {collapsed && showBadge && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#0c100f]" />
                      )}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        {showBadge && (
                          <span className="shrink-0 min-h-5 min-w-5 px-1.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center justify-center">
                            {stockAlertCount > 99 ? "99+" : stockAlertCount}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
