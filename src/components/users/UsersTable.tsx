"use client";

import Link from "next/link";
import { Shield, ShieldCheck } from "lucide-react";

type UserRow = {
  id: number;
  email: string;
  fullName: string | null;
  role: string;
  roleLabel: string;
  isActive: boolean;
  permissionsCount: number | null;
  lastLoginAt: string | null;
};

export function UsersTable({ items }: { items: UserRow[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rapid-border text-left text-xs uppercase tracking-wider text-rapid-text-muted">
            <th className="px-4 py-3 font-semibold">Usuario</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Permisos</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Último acceso</th>
            <th className="px-4 py-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rapid-border">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-rapid-bg/50">
              <td className="px-4 py-3">
                <p className="font-medium">{item.fullName || "—"}</p>
                <p className="text-xs text-rapid-text-muted">{item.email}</p>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  {item.role === "COMPANY_ADMIN" ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-rapid-green" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-rapid-text-muted" />
                  )}
                  {item.roleLabel}
                </span>
              </td>
              <td className="px-4 py-3 text-rapid-text-muted text-xs">
                {item.permissionsCount === null
                  ? "Acceso completo"
                  : `${item.permissionsCount} módulo${item.permissionsCount !== 1 ? "s" : ""}`}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    item.isActive
                      ? "bg-rapid-green-soft text-rapid-green-dark"
                      : "bg-rapid-bg text-rapid-text-muted"
                  }`}
                >
                  {item.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-rapid-text-muted">
                {item.lastLoginAt ?? "Nunca"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/users/${item.id}`}
                  className="text-xs font-semibold text-rapid-green-dark hover:underline"
                >
                  Gestionar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
