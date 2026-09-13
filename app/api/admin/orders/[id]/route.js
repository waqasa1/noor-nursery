import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth/session";
import {
  sendOrderStatusUpdate,
  sendPaymentReceivedEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const updateSchema = z.object({
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  internalNote: z.string().optional(),
  resendEmail: z.boolean().optional(),
  resendConfirmation: z.boolean().optional(),
});

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).lean();
    if (!order) return jsonError("Order not found", 404);
    return jsonSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400);
    }

    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) return jsonError("Order not found", 404);

    const prevPaymentStatus = order.paymentStatus;
    if (parsed.data.orderStatus) order.orderStatus = parsed.data.orderStatus;
    if (parsed.data.paymentStatus) order.paymentStatus = parsed.data.paymentStatus;
    if (parsed.data.internalNote !== undefined) order.internalNote = parsed.data.internalNote;
    await order.save();

    if (parsed.data.resendEmail) {
      const statusMsg = `Your order status is now: ${order.orderStatus.replace("_", " ")}`;
      sendOrderStatusUpdate(order.toObject(), statusMsg).catch(() => {});
    }

    if (parsed.data.resendConfirmation) {
      sendOrderConfirmationEmail(order.toObject()).catch(() => {});
    }

    if (parsed.data.paymentStatus === "paid" && prevPaymentStatus !== "paid") {
      sendPaymentReceivedEmail(order.toObject()).catch(() => {});
    }

    return jsonSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
