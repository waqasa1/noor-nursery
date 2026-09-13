import { isDBConfigured, connectDB } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { jsonSuccess } from "@/lib/api-response";

export async function GET() {
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
