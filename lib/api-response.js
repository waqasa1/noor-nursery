import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookieOnResponse } from "@/lib/auth/session";

export function jsonSuccess(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

/** JSON response with session cookie attached (use after login/signup). */
export async function jsonSuccessWithSession(user, data, status = 200) {
  const token = await createSessionToken(user);
  const response = NextResponse.json({ success: true, ...data }, { status });
  return setSessionCookieOnResponse(response, token);
}

export function jsonError(message, status = 400, errors = null) {
  return NextResponse.json(
    { success: false, message, errors },
    { status }
  );
}

export function handleApiError(error) {
  if (error.message === "UNAUTHORIZED") return jsonError("Unauthorized", 401);
  if (error.message === "FORBIDDEN") return jsonError("Forbidden", 403);
  console.error("[api]", error);
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : error.message;
  return jsonError(message, 500);
}
