"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive } from "./nav-config";
import { useSidebar } from "./SidebarContext";

export function SidebarFooter() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const settingsActive = isNavActive(pathname, "/settings");

  return (
    <div
      className={cn(
        "shrink-0 py-4 border-t border-white/[0.08] bg-black/20",
        collapsed ? "px-2" : "px-3",
      )}
    >
      <Link
        href="/settings"
        title={collapsed ? "Configuración" : undefined}
        className={cn(
          "group flex items-center rounded-xl text-[13px] font-medium transition-all duration-150",
          collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5",
          settingsActive
            ? "bg-white/10 text-white"
            : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
        )}
      >
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg transition-colors",
            collapsed ? "h-9 w-9" : "h-8 w-8",
            settingsActive
              ? "bg-white/15 text-white"
              : "bg-white/[0.06] text-white/50 group-hover:bg-white/10",
          )}
        >
          <Settings className="h-4 w-4" strokeWidth={2.25} />
        </span>
        {!collapsed && (
          <span className="truncate flex-1 text-left">Configuración</span>
        )}
      </Link>
    </div>
  );
}
