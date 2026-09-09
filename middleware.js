import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE, getAuthSecretKey } from "@/lib/auth/session";

const adminPaths = ["/admin"];
const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
const protectedPaths = ["/account", "/checkout"];

async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const isAdminRoute = adminPaths.some((p) => pathname.startsWith(p));
  const isAuthRoute = authPaths.some((p) => pathname.startsWith(p));
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?redirect=/admin", request.url));
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/account?error=forbidden", request.url));
    }
  }

  if (isProtected && !session && pathname.startsWith("/account")) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
};
