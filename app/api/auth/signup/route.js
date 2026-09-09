import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, normalizeEmail, validatePassword } from "@/lib/auth/password";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccessWithSession, jsonError, handleApiError } from "@/lib/api-response";
import { sendWelcomeEmail } from "@/lib/email";

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`signup:${ip}`, { maxAttempts: 5 });
    if (!limit.allowed) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const pwCheck = validatePassword(parsed.data.password);
    if (!pwCheck.valid) return jsonError(pwCheck.message, 400);

    await connectDB();
    const email = normalizeEmail(parsed.data.email);
    const existing = await User.findOne({ email });
    if (existing) {
      return jsonError("Unable to create account with this email", 400);
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone.trim(),
      passwordHash,
      role: "customer",
    });

    sendWelcomeEmail({ name: user.name, email: user.email }).catch(() => {});

    return jsonSuccessWithSession(
      user,
      { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
