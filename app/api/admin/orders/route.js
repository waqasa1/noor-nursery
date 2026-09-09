import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth/session";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search");
    const orderStatus = searchParams.get("orderStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const paymentMethod = searchParams.get("paymentMethod");

    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return jsonSuccess({ orders, pagination: { page, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleApiError(error);
  }
}
