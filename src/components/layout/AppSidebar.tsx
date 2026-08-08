"use client";

import type { InventoryStockAlert } from "@/lib/inventory/alerts";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { SidebarNav } from "./SidebarNav";
import { SidebarStockAlerts } from "./SidebarStockAlerts";
import { SidebarFooter } from "./SidebarFooter";
import { SessionBar } from "./SessionBar";
import { useSidebar } from "./SidebarContext";

interface Props {
  alerts: InventoryStockAlert[];
  total: number;
  session: {
    email: string;
    fullName: string | null;
    companyName: string | null;
  };
  workshop?: {
    businessName: string | null;
    logoUrl: string | null;
  };
}

export function AppSidebar({ alerts, total, session, workshop }: Props) {
  const { collapsed, toggle, ready } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:flex shrink-0 h-screen sticky top-0",
        "border-r border-rapid-border bg-white",
        "transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        collapsed ? "w-[68px]" : "w-[240px]",
        !ready && "w-[240px]",
      )}
    >
      {/* Main sidebar content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header — Workshop logo & name */}
        {collapsed ? (
          <div className="shrink-0 flex flex-col items-center px-2 py-4 border-b border-rapid-border">
            {workshop?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workshop.logoUrl}
                alt={workshop.businessName ?? "Logo"}
                className="w-10 h-10 rounded-lg object-contain"
              />
            ) : (
              <Logo variant="light" compact />
            )}
          </div>
        ) : (
          <div className="shrink-0 flex flex-col items-center px-4 pt-5 pb-4 border-b border-rapid-border">
            {/* Logo — full width, generous height */}
            {workshop?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workshop.logoUrl}
                alt={workshop.businessName ?? "Logo"}
                className="w-full h-14 object-contain"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-rapid-green flex items-center justify-center shadow-[0_2px_8px_rgba(0,200,83,0.25)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            {/* Workshop name — below logo, left-aligned */}
            <span className="mt-2.5 text-[13px] font-semibold text-rapid-text truncate w-full text-center">
              {workshop?.businessName || "Rapid"}
            </span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
          <SidebarNav stockAlertCount={total} />
          <SidebarStockAlerts alerts={alerts} total={total} />
        </div>

        <SidebarFooter />
        <SessionBar
          email={session.email}
          fullName={session.fullName}
          companyName={session.companyName}
          collapsed={collapsed}
        />
      </div>

      {/* Collapse rail — full-height vertical strip on the right edge */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
        title={collapsed ? "Expandir menú" : "Contraer menú"}
        className={cn(
          "group shrink-0 w-7 flex items-center justify-center",
          "border-l border-rapid-border bg-rapid-surface-soft/50",
          "transition-colors duration-150 cursor-pointer",
          "hover:bg-rapid-surface-strong",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "w-4 h-4 text-rapid-text-muted transition-transform duration-200",
            collapsed ? "rotate-0" : "rotate-180",
          )}
        >
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </aside>
  );
}
