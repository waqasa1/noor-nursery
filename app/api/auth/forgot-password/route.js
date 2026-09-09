import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateResetToken, normalizeEmail } from "@/lib/auth/password";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { getEnv } from "@/lib/env";
import { sendPasswordResetEmail } from "@/lib/email";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const schema = z.object({ email: z.string().email() });

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`forgot:${ip}`, { maxAttempts: 3, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) {
      return jsonError("Too many requests. Please try again later.", 429);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonSuccess({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    await connectDB();
    const user = await User.findOne({ email: normalizeEmail(parsed.data.email) });

    if (user) {
      const { token, hash } = generateResetToken();
      user.passwordResetTokenHash = hash;
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const resetUrl = `${getEnv().NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      sendPasswordResetEmail(user.email, resetUrl).catch(() => {});
    }

    return jsonSuccess({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
