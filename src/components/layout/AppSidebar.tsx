"use client";

import type { InventoryStockAlert } from "@/lib/inventory/alerts";
import { PanelLeftClose, PanelLeft } from "lucide-react";
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
}

export function AppSidebar({ alerts, total, session }: Props) {
  const { collapsed, toggle, ready } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:flex shrink-0 flex-col min-h-screen border-r border-white/[0.06] bg-[#0c100f] text-white transition-[width] duration-200 ease-out",
        collapsed ? "w-[76px]" : "w-[260px]",
        !ready && "w-[260px]",
      )}
    >
      {collapsed ? (
        <div className="shrink-0 flex flex-col items-center gap-3 px-2 py-5">
          <Logo variant="dark" compact />
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white transition"
            aria-label="Expandir menú"
            title="Expandir menú"
          >
            <PanelLeft className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className="shrink-0 flex items-start justify-between gap-2 px-4 py-5">
          <div className="min-w-0">
            <Logo variant="dark" />
            <p className="mt-2 pl-[46px] text-[11px] text-white/40 font-medium whitespace-nowrap">
              Gestión de taller
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white transition"
            aria-label="Contraer menú"
            title="Contraer menú"
          >
            <PanelLeftClose className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      )}

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
    </aside>
  );
}
