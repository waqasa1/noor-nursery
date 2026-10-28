import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth/session-token";

const adminPaths = ["/admin"];
const protectedPaths = ["/account"];

function clearSessionAndRedirect(request, path) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAdminRoute = adminPaths.some((p) => pathname.startsWith(p));
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Missing/invalid JWT → login (cookie cleared). sessionVersion is checked in layouts/APIs.
  if (isAdminRoute) {
    if (!session) {
      return clearSessionAndRedirect(
        request,
        `/login?redirect=${encodeURIComponent(pathname)}`
      );
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/account?error=forbidden", request.url));
    }
  }

  if (isProtected && !session) {
    return clearSessionAndRedirect(
      request,
      `/login?redirect=${encodeURIComponent(pathname)}`
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
