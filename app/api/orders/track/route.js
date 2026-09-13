import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const schema = z.object({
  orderNumber: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine((d) => d.email || d.phone, {
  message: "Email or phone required",
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`track:${ip}`, { maxAttempts: 20, windowMs: 15 * 60 * 1000 });
    if (!limit.allowed) {
      return jsonError("Too many lookup attempts. Please wait.", 429);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Please provide order number and email or phone", 400);
    }

    await connectDB();
    const query = { orderNumber: parsed.data.orderNumber.toUpperCase() };
    if (parsed.data.email) query["customer.email"] = parsed.data.email.toLowerCase();
    if (parsed.data.phone) query["customer.phone"] = parsed.data.phone;

    const order = await Order.findOne(query).select(
      "orderNumber orderStatus paymentStatus paymentMethod total createdAt items customer shippingAddress"
    ).lean();

    if (!order) {
      return jsonError("Order not found. Check your order number and contact details.", 404);
    }

    return jsonSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
