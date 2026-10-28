import { isDBConfigured, connectDB } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { jsonSuccess } from "@/lib/api-response";

/**
 * Public probe returns only status + timestamp.
 * Detailed checks require header x-health-secret matching HEALTH_CHECK_SECRET
 * (or AUTH_SECRET when HEALTH_CHECK_SECRET is unset).
 */
export async function GET(request) {
  const secret =
    process.env.HEALTH_CHECK_SECRET || getEnv().AUTH_SECRET || "";
  const provided = request.headers.get("x-health-secret") || "";
  const detailed = Boolean(secret && provided && provided === secret);

  if (!detailed) {
    return jsonSuccess({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }

  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "not_configured",
    email: getEnv().RESEND_API_KEY ? "configured" : "not_configured",
  };

  if (isDBConfigured()) {
    try {
      await connectDB();
      checks.database = "connected";
    } catch {
      checks.database = "error";
      checks.status = "degraded";
    }
  }

  return jsonSuccess(checks, checks.status === "ok" ? 200 : 503);
}
