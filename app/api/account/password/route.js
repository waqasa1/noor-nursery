import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { sendPasswordChangedEmail } from "@/lib/email";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400);
    }

    await connectDB();
    const user = await User.findById(session.userId).select("+passwordHash");
    if (!user) return jsonError("User not found", 404);

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return jsonError("Current password is incorrect", 400);
    }

    user.passwordHash = await hashPassword(parsed.data.newPassword);
    await user.save();

    sendPasswordChangedEmail(user.email, user.name).catch(() => {});

    return jsonSuccess({ message: "Password updated" });
  } catch (error) {
    return handleApiError(error);
  }
}
