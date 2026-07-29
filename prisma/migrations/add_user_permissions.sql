-- Migration: add_user_permissions
-- Agrega campo de permisos por módulo a los usuarios

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "Permissions" TEXT;

-- Permissions es un JSON array de strings con los módulos permitidos.
-- NULL o vacío = acceso total (para admins).
-- Ejemplo: ["dashboard","work-orders","quotations","invoices"]
