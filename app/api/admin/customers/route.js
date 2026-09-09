import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth/session";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search");

    const filter = { role: "customer" };
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip((page - 1) * 20)
        .limit(20)
        .lean(),
      User.countDocuments(filter),
    ]);

    return jsonSuccess({ customers, pagination: { page, total } });
  } catch (error) {
    return handleApiError(error);
  }
}
