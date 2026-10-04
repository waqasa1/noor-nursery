import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const proofSchema = z.object({
  orderNumber: z.string().min(6).max(32),
  trxId: z
    .string()
    .trim()
    .min(4, "Enter the transaction ID (TrxID)")
    .max(64, "Transaction ID looks too long")
    .regex(/^[A-Za-z0-9-]+$/, "TrxID can only contain letters, numbers and dashes"),
});

/**
 * Customer submits the EasyPaisa transaction ID after sending money.
 * This never marks the order paid — the seller confirms the TrxID inside
 * their own EasyPaisa app first (admin marks the payment received).
 */
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`payment-proof:${ip}`, { maxAttempts: 10 });
    if (!limit.allowed) {
      return jsonError("Too many attempts. Please wait a moment.", 429);
    }

    const body = await request.json();
    const parsed = proofSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues?.[0]?.message || "Invalid transaction ID", 400);
    }

    const { orderNumber, trxId } = parsed.data;

    await connectDB();
    const order = await Order.findOne({ orderNumber });
    if (!order) return jsonError("Order not found", 404);

    if (order.paymentMethod !== "easypaisa") {
      return jsonError("This order does not use EasyPaisa payment", 400);
    }

    if (order.paymentStatus === "paid") {
      return jsonSuccess({
        alreadyPaid: true,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        message: "Payment for this order is already confirmed.",
      });
    }

    const duplicate = await Order.findOne({
      paymentReference: trxId,
      paymentMethod: "easypaisa",
      _id: { $ne: order._id },
    });

    order.paymentReference = trxId;
    order.paymentStatus = "pending";
    order.orderStatus = "payment_review";
    order.paymentGatewayResponse = {
      ...(order.paymentGatewayResponse || {}),
      type: "manual_easypaisa",
      trxId,
      submittedAt: new Date().toISOString(),
      submittedIp: ip,
      reusedTrxId: !!duplicate,
    };
    await order.save();

    return jsonSuccess({
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trxId,
      duplicateWarning: duplicate
        ? "This TrxID is already used on another order — verification may take longer."
        : null,
      message: "Transaction ID submitted. Verification usually takes a few minutes.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
