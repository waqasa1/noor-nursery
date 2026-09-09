const store = new Map();

/**
 * Simple in-memory rate limiter for development/single-instance.
 * For production multi-instance, use Redis-based rate limiting.
 */
export function rateLimit(key, { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.start > windowMs) {
    store.set(key, { count: 1, start: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
