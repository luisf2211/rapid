import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, USER_ROLES } from "@/lib/auth/constants";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/api/auth/login"];

function getAuthSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "rapid-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

async function readSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return {
      role: String(payload.role ?? ""),
      companyId:
        payload.companyId == null ? null : Number(payload.companyId),
    };
  } catch {
    return null;
  }
}

function withSupabaseCookies(
  response: NextResponse,
  supabaseResponse: NextResponse,
) {
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg")
  ) {
    return supabaseResponse;
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return supabaseResponse;
  }

  const session = await readSession(request);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withSupabaseCookies(
      NextResponse.redirect(loginUrl),
      supabaseResponse,
    );
  }

  if (pathname.startsWith("/admin")) {
    if (session.role !== USER_ROLES.PLATFORM_ADMIN) {
      return withSupabaseCookies(
        NextResponse.redirect(new URL("/dashboard", request.url)),
        supabaseResponse,
      );
    }
    return supabaseResponse;
  }

  if (session.role === USER_ROLES.PLATFORM_ADMIN) {
    return withSupabaseCookies(
      NextResponse.redirect(new URL("/admin", request.url)),
      supabaseResponse,
    );
  }

  if (session.companyId == null) {
    return withSupabaseCookies(
      NextResponse.redirect(new URL("/login", request.url)),
      supabaseResponse,
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|uploads|print).*)",
  ],
};
