import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, normalizeEmail } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`login:${ip}`, { maxAttempts: 10 });
    if (!limit.allowed) {
      return jsonError("Too many login attempts. Please try again later.", 429);
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid email or password", 400);
    }

    await connectDB();
    const user = await User.findOne({ email: normalizeEmail(parsed.data.email) }).select(
      "+passwordHash"
    );
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    await createSession(user);

    return jsonSuccess({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
