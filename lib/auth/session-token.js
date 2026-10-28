import { SignJWT, jwtVerify } from "jose";
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

/** JWT only — safe for Edge middleware (no DB). */
export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionToken(user) {
  const sessionVersion = Number(user.sessionVersion ?? 0);
  return new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    sv: sessionVersion,
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

/** Clear session cookie on a Route Handler response. */
export function clearSessionCookieOnResponse(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
