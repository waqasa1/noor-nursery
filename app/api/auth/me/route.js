import { getSession } from "@/lib/auth/session";
import { jsonSuccess, jsonError } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError("Not authenticated", 401);
  return jsonSuccess({ user: session });
}
