"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive } from "./nav-config";
import { useSidebar } from "./SidebarContext";

function FooterLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: typeof CircleHelp;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-xl text-[13px] font-medium transition-all duration-150",
        collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5",
        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg transition-colors",
          collapsed ? "h-9 w-9" : "h-8 w-8",
          active
            ? "bg-white/15 text-white"
            : "bg-white/[0.06] text-white/50 group-hover:bg-white/10",
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </span>
      {!collapsed && (
        <span className="truncate flex-1 text-left">{label}</span>
      )}
    </Link>
  );
}

export function SidebarFooter() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const guideActive = isNavActive(pathname, "/guia");

  return (
    <div
      className={cn(
        "shrink-0 py-4 border-t border-white/[0.08] bg-black/20",
        collapsed ? "px-2" : "px-3",
      )}
    >
      {!collapsed && (
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
          Ayuda
        </p>
      )}
      <div className="space-y-1">
        <FooterLink
          href="/guia"
          icon={CircleHelp}
          label="Guía rápida"
          active={guideActive}
          collapsed={collapsed}
        />
        <div
          aria-disabled="true"
          title={collapsed ? "Configuración (próximamente)" : "Próximamente"}
          className={cn(
            "flex items-center rounded-xl text-[13px] font-medium text-white/25 cursor-not-allowed select-none",
            collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5",
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-white/[0.04]",
              collapsed ? "h-9 w-9" : "h-8 w-8",
            )}
          >
            <Settings className="h-4 w-4" strokeWidth={2.25} />
          </span>
          {!collapsed && <span className="flex-1">Configuración</span>}
        </div>
      </div>
    </div>
  );
}
