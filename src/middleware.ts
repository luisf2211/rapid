import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, USER_ROLES } from "@/lib/auth/constants";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const session = await readSession(request);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (session.role !== USER_ROLES.PLATFORM_ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (session.role === USER_ROLES.PLATFORM_ADMIN) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (session.companyId == null) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|uploads|print).*)",
  ],
};
