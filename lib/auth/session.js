import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "../env";

export const SESSION_COOKIE = "noor_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET || getEnv().AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be at least 32 characters in production");
    }
    return new TextEncoder().encode("dev-only-secret-min-32-chars!!");
  }
  return new TextEncoder().encode(secret);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}

export async function createSessionToken(user) {
  return new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecretKey());
}

/** Attach session cookie to a Route Handler response (required for Vercel/production). */
export function setSessionCookieOnResponse(response, token) {
  response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
  return response;
}

/** For Server Actions / pages that mutate cookies() directly. */
export async function createSession(user) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions());
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

/** Clear session cookie on a Route Handler response. */
export function clearSessionCookieOnResponse(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}
