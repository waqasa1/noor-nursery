import { cookies } from "next/headers";
import { connectDB, isDBConfigured } from "@/lib/db";
import User from "@/models/User";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  getAuthSecretKey,
  getSessionCookieOptions,
  setSessionCookieOnResponse,
  clearSessionCookieOnResponse,
  verifySessionToken,
} from "@/lib/auth/session-token";

export {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  getAuthSecretKey,
  getSessionCookieOptions,
  setSessionCookieOnResponse,
  clearSessionCookieOnResponse,
  verifySessionToken,
};

/** For Server Actions / pages that mutate cookies() directly. */
export async function createSession(user) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions());
  return token;
}

async function clearInvalidSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, "", {
      ...getSessionCookieOptions(),
      maxAge: 0,
    });
  } catch {
    // cookies() can be read-only in some RSC contexts — ignore
  }
}

/**
 * Verify JWT and ensure sessionVersion still matches the user
 * (password changes bump the version and invalidate older cookies).
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.sub) {
    await clearInvalidSessionCookie();
    return null;
  }

  if (!isDBConfigured()) {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      sessionVersion: Number(payload.sv ?? 0),
    };
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub)
      .select("sessionVersion role name email")
      .lean();

    if (!user) {
      await clearInvalidSessionCookie();
      return null;
    }

    const tokenSv = Number(payload.sv ?? 0);
    const userSv = Number(user.sessionVersion ?? 0);
    if (tokenSv !== userSv) {
      await clearInvalidSessionCookie();
      return null;
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      sessionVersion: userSv,
    };
  } catch {
    await clearInvalidSessionCookie();
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

/** Bump so all existing JWTs for this user stop working. */
export function bumpSessionVersion(user) {
  user.sessionVersion = Number(user.sessionVersion ?? 0) + 1;
  return user.sessionVersion;
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
