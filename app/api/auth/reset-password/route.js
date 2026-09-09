import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, hashResetToken, validatePassword } from "@/lib/auth/password";
import { destroySession } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { sendPasswordChangedEmail } from "@/lib/email";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`reset:${ip}`, { maxAttempts: 5 });
    if (!limit.allowed) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const pwCheck = validatePassword(parsed.data.password);
    if (!pwCheck.valid) return jsonError(pwCheck.message, 400);

    await connectDB();
    const tokenHash = hashResetToken(parsed.data.token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      return jsonError("Invalid or expired reset link", 400);
    }

    user.passwordHash = await hashPassword(parsed.data.password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    await destroySession();
    sendPasswordChangedEmail(user.email, user.name).catch(() => {});

    return jsonSuccess({ message: "Password updated successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
