"use client";

import { LogOut, ChevronRight } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

type Props = {
  email: string;
  fullName: string | null;
  companyName: string | null;
  collapsed?: boolean;
};

export function SessionBar({ email, fullName, companyName, collapsed }: Props) {
  return (
    <div
      className={
        collapsed
          ? "px-2 py-3 border-t border-rapid-border"
          : "px-3 py-3 border-t border-rapid-border"
      }
    >
      {!collapsed && (
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rapid-surface-strong text-rapid-text-muted text-xs font-semibold uppercase">
            {(fullName ?? email).charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-rapid-text truncate leading-tight">
              {fullName ?? email}
            </p>
            <p className="text-[11px] text-rapid-text-muted truncate">
              {companyName ?? "Taller"}
            </p>
          </div>
        </div>
      )}
      <form action={logoutAction}>
        <button
          type="submit"
          title="Cerrar sesión"
          className={
            collapsed
              ? "w-full flex justify-center p-2 rounded-lg text-rapid-text-muted hover:bg-rapid-surface-strong hover:text-rapid-text transition-colors"
              : "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-rapid-text-muted hover:bg-rapid-surface-strong hover:text-rapid-text transition-colors"
          }
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </form>
    </div>
  );
}
