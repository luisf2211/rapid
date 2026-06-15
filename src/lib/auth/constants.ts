export const AUTH_COOKIE_NAME = "rapid_session";

export const USER_ROLES = {
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  COMPANY_USER: "COMPANY_USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  PLATFORM_ADMIN: "Administrador plataforma",
  COMPANY_ADMIN: "Administrador taller",
  COMPANY_USER: "Usuario taller",
};

export const PLATFORM_ADMIN_EMAIL =
  process.env.PLATFORM_ADMIN_EMAIL ?? "admin@rapid.local";
