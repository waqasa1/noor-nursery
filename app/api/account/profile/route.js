import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth/session";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
});

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();
    const user = await User.findById(session.userId)
      .select("name email phone addresses emailVerified createdAt")
      .lean();
    if (!user) return jsonError("User not found", 404);
    return jsonSuccess({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400);
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.userId,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).select("name email phone addresses");

    return jsonSuccess({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
