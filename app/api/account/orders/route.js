import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth/session";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();

    const orders = await Order.find({
      $or: [{ userId: session.userId }, { "customer.email": session.email }],
    })
      .select("orderNumber orderStatus paymentStatus paymentMethod total createdAt items")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return jsonSuccess({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}
