import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "../env";

const SESSION_COOKIE = "noor_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = getEnv().AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be at least 32 characters in production");
    }
    return new TextEncoder().encode("dev-only-secret-min-32-chars!!");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user) {
  const token = await new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
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
