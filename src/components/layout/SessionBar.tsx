"use client";

import { LogOut } from "lucide-react";
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
          ? "px-2 py-3 border-t border-white/[0.08]"
          : "px-3 py-3 border-t border-white/[0.08] space-y-2"
      }
    >
      {!collapsed && (
        <div className="px-1">
          <p className="text-xs text-white/45 truncate">
            {companyName ?? "Taller"}
          </p>
          <p className="text-sm font-medium text-white truncate">
            {fullName ?? email}
          </p>
        </div>
      )}
      <form action={logoutAction}>
        <button
          type="submit"
          title="Cerrar sesión"
          className={
            collapsed
              ? "w-full flex justify-center p-2 rounded-lg text-white/55 hover:bg-white/[0.06] hover:text-white"
              : "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10"
          }
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Salir</span>}
        </button>
      </form>
    </div>
  );
}
