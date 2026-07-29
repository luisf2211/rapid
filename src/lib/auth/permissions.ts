import { USER_ROLES, type UserRole } from "./constants";

/**
 * Módulos del sistema con sus rutas asociadas.
 * El key es el identificador del permiso, el value contiene label y paths.
 */
export const SYSTEM_MODULES = {
  dashboard: {
    label: "Panel / Dashboard",
    paths: ["/dashboard"],
  },
  quotations: {
    label: "Cotizaciones",
    paths: ["/quotations"],
  },
  "work-orders": {
    label: "Órdenes de recepción",
    paths: ["/work-orders"],
  },
  "material-requisitions": {
    label: "Requisiciones de materiales",
    paths: ["/material-requisitions"],
  },
  "labor-orders": {
    label: "Mano de obra",
    paths: ["/labor-orders"],
  },
  invoices: {
    label: "Facturación",
    paths: ["/invoices"],
  },
  employees: {
    label: "Empleados",
    paths: ["/employees"],
  },
  payments: {
    label: "Pagos / Nómina",
    paths: ["/payments"],
  },
  inventory: {
    label: "Inventario",
    paths: ["/inventory"],
  },
  expenses: {
    label: "Gastos",
    paths: ["/expenses"],
  },
  "petty-cash": {
    label: "Caja chica",
    paths: ["/petty-cash"],
  },
  banks: {
    label: "Bancos",
    paths: ["/banks"],
  },
  settings: {
    label: "Configuración",
    paths: ["/settings"],
  },
  users: {
    label: "Gestión de usuarios",
    paths: ["/users"],
  },
} as const;

export type ModuleKey = keyof typeof SYSTEM_MODULES;

export const ALL_MODULE_KEYS = Object.keys(SYSTEM_MODULES) as ModuleKey[];

export const MODULE_OPTIONS: { value: ModuleKey; label: string }[] =
  ALL_MODULE_KEYS.map((key) => ({
    value: key,
    label: SYSTEM_MODULES[key].label,
  }));

/**
 * Parse permissions stored as JSON string in the User.permissions field.
 * Returns null if the user has full access (admin or empty permissions).
 */
export function parsePermissions(
  permissionsJson: string | null | undefined,
): ModuleKey[] | null {
  if (!permissionsJson) return null;
  try {
    const parsed = JSON.parse(permissionsJson);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.filter((p: string) => p in SYSTEM_MODULES) as ModuleKey[];
  } catch {
    return null;
  }
}

/**
 * Check if a user has access to a given path.
 * COMPANY_ADMIN always has full access.
 * COMPANY_USER respects the permissions list.
 */
export function hasModuleAccess(
  role: UserRole,
  permissionsJson: string | null | undefined,
  pathname: string,
): boolean {
  // Admins always have full access
  if (role === USER_ROLES.PLATFORM_ADMIN || role === USER_ROLES.COMPANY_ADMIN) {
    return true;
  }

  const permissions = parsePermissions(permissionsJson);
  // If no restrictions configured, allow all
  if (!permissions) return true;

  // Check if the pathname matches any allowed module
  for (const moduleKey of permissions) {
    const mod = SYSTEM_MODULES[moduleKey];
    if (mod.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return true;
    }
  }

  // Print pages are accessible if the parent module is accessible
  if (pathname.startsWith("/print/")) {
    const printSubpath = pathname.replace("/print", "");
    return hasModuleAccess(role, permissionsJson, printSubpath);
  }

  return false;
}

/**
 * Serialize permissions array to JSON for storage.
 */
export function serializePermissions(modules: ModuleKey[]): string | null {
  if (modules.length === 0) return null;
  return JSON.stringify(modules);
}
