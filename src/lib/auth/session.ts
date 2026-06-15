import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  PLATFORM_ADMIN_EMAIL,
  type UserRole,
} from "@/lib/auth/constants";

export type SessionPayload = {
  userId: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  companyId: number | null;
  companyName: string | null;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "rapid-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const userId = Number(payload.userId);
    if (!Number.isFinite(userId)) return null;
    return {
      userId,
      email: String(payload.email ?? ""),
      fullName: payload.fullName ? String(payload.fullName) : null,
      role: String(payload.role) as UserRole,
      companyId:
        payload.companyId == null ? null : Number(payload.companyId),
      companyName: payload.companyName ? String(payload.companyName) : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function normalizeLoginEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (trimmed === "admin") return PLATFORM_ADMIN_EMAIL;
  return trimmed;
}
