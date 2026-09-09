import { requireAdmin } from "@/lib/auth/session";

export async function withAdmin(handler) {
  return async (...args) => {
    try {
      const session = await requireAdmin();
      return handler(session, ...args);
    } catch (error) {
      if (error.message === "UNAUTHORIZED") {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
      }
      throw error;
    }
  };
}
