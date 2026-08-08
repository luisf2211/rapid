"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, Key } from "lucide-react";
import { USER_ROLES } from "@/lib/auth/constants";
import { MODULE_OPTIONS, type ModuleKey } from "@/lib/auth/permissions";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  resetPasswordAction,
} from "@/app/(app)/users/actions";

interface Props {
  mode: "create" | "edit";
  userId?: number;
  defaultValues?: {
    email: string;
    fullName: string;
    role: "COMPANY_ADMIN" | "COMPANY_USER";
    permissions: ModuleKey[];
    isActive: boolean;
  };
}

export function UserForm({ mode, userId, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState(defaultValues?.email ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(defaultValues?.fullName ?? "");
  const [role, setRole] = useState<string>(USER_ROLES.COMPANY_USER);
  const [permissions, setPermissions] = useState<Set<string>>(
    new Set(defaultValues?.permissions ?? []),
  );
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true);

  // Reset password state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const togglePermission = (key: string) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setPermissions(new Set(MODULE_OPTIONS.map((m) => m.value)));
  const clearAll = () => setPermissions(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    startTransition(async () => {
      const permArray = Array.from(permissions);
      let result;

      if (mode === "create") {
        result = await createUserAction({
          email,
          password,
          fullName,
          role,
          permissions: permArray,
        });
      } else if (userId != null) {
        result = await updateUserAction(userId, {
          fullName,
          role,
          permissions: permArray,
          isActive,
        });
      } else {
        return;
      }

      if (result.ok) {
        if (mode === "create") {
          router.push("/users");
        } else {
          setSuccess(true);
        }
      } else {
        setSubmitError(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!userId) return;
    if (!confirm("¿Desactivar este usuario? No podrá iniciar sesión.")) return;
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result.ok) router.push("/users");
      else setSubmitError(result.error);
    });
  };

  const handleResetPassword = () => {
    if (!userId || !newPassword) return;
    startTransition(async () => {
      const result = await resetPasswordAction(userId, { password: newPassword });
      if (result.ok) {
        setNewPassword("");
        setShowResetPassword(false);
        setSuccess(true);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-12 max-w-3xl">
      <div className="card sticky top-0 z-10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 backdrop-blur-md bg-white/90 border-b border-rapid-border">
        <Link href="/users" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Usuarios
        </Link>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Desactivar
            </button>
          )}
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save className="w-4 h-4" />
            {isPending ? "Guardando..." : mode === "create" ? "Crear usuario" : "Guardar"}
          </button>
        </div>
      </div>

      {submitError && (
        <div className="card border-red-200 bg-red-50 p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {success && (
        <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Cambios guardados correctamente.
        </div>
      )}

      {/* Basic info */}
      <section className="card p-5">
        <h2 className="text-sm font-semibold text-rapid-text mb-4">Información del usuario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nombre completo *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Pérez"
              className="form-input w-full"
              required
            />
          </div>
          <div>
            <label className="form-label">Correo electrónico *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@taller.com"
              className="form-input w-full"
              required
              disabled={mode === "edit"}
            />
          </div>
          {mode === "create" && (
            <div>
              <label className="form-label">Contraseña *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="form-input w-full"
                required
                minLength={6}
              />
            </div>
          )}
          <div>
            <label className="form-label">Rol</label>
            <div className="form-input w-full bg-rapid-bg/50 text-rapid-text-muted cursor-not-allowed">
              Usuario del taller
            </div>
            <input type="hidden" value={USER_ROLES.COMPANY_USER} />
            <p className="text-[11px] text-rapid-text-muted mt-1">
              Los usuarios creados desde aquí solo tienen acceso a los módulos que selecciones abajo.
            </p>
          </div>
          {mode === "edit" && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-rapid-border"
                />
                <span className="text-sm font-medium">Usuario activo</span>
              </label>
            </div>
          )}
        </div>
      </section>

      {/* Permissions */}
      <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-rapid-text">Permisos de acceso</h2>
              <p className="text-xs text-rapid-text-muted mt-0.5">
                Selecciona los módulos a los que este usuario podrá acceder.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-rapid-green-dark font-medium hover:underline"
              >
                Todos
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-rapid-text-muted font-medium hover:underline"
              >
                Ninguno
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MODULE_OPTIONS.map((mod) => (
              <label
                key={mod.value}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-rapid-bg/50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={permissions.has(mod.value)}
                  onChange={() => togglePermission(mod.value)}
                  className="w-4 h-4 rounded border-rapid-border text-rapid-green focus:ring-rapid-green"
                />
                <span className="text-sm font-medium">{mod.label}</span>
              </label>
            ))}
          </div>
          {permissions.size === 0 && (
            <p className="text-xs text-amber-600 mt-3">
              Sin permisos seleccionados. El usuario no podrá acceder a ningún módulo.
            </p>
          )}
        </section>

      {/* Reset password (edit mode only) */}
      {mode === "edit" && (
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-rapid-text mb-2">Seguridad</h2>
          {showResetPassword ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="form-input w-full"
                  minLength={6}
                />
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isPending || newPassword.length < 6}
                className="btn-primary"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="btn-secondary"
            >
              <Key className="w-4 h-4" />
              Restablecer contraseña
            </button>
          )}
        </section>
      )}
    </form>
  );
}
