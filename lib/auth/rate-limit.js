import { isDBConfigured, connectDB } from "@/lib/db";

const memoryStore = new Map();

/**
 * Rate limiter with in-memory fallback and MongoDB persistence when DB is available.
 */
export function rateLimit(key, { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now - entry.start > windowMs) {
    memoryStore.set(key, { count: 1, start: now });
    persistRateLimit(key, 1, new Date(now + windowMs)).catch(() => {});
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  persistRateLimit(key, entry.count, new Date(entry.start + windowMs)).catch(() => {});
  return { allowed: true, remaining: maxAttempts - entry.count };
}

async function persistRateLimit(key, count, resetAt) {
  if (!isDBConfigured()) return;
  try {
    const { default: RateLimit } = await import("@/models/RateLimit");
    await connectDB();
    await RateLimit.findOneAndUpdate(
      { key },
      { count, resetAt },
      { upsert: true }
    );
  } catch {
    // Non-blocking — memory store still protects single instance
  }
}

export async function rateLimitAsync(key, options = {}) {
  const { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = options;

  if (isDBConfigured()) {
    try {
      const { default: RateLimit } = await import("@/models/RateLimit");
      await connectDB();
      const now = new Date();
      const existing = await RateLimit.findOne({ key });

      if (!existing || existing.resetAt <= now) {
        await RateLimit.findOneAndUpdate(
          { key },
          { count: 1, resetAt: new Date(now.getTime() + windowMs) },
          { upsert: true }
        );
        return { allowed: true, remaining: maxAttempts - 1 };
      }

      if (existing.count >= maxAttempts) {
        const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
        return { allowed: false, remaining: 0, retryAfter };
      }

      existing.count += 1;
      await existing.save();
      return { allowed: true, remaining: maxAttempts - existing.count };
    } catch {
      // Fall through to memory store
    }
  }

  return rateLimit(key, options);
}

export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
