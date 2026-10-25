import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { rateLimitAsync, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";
import { sendTidReceivedEmail } from "@/lib/email";

const MANUAL_WALLET_METHODS = new Set(["jazzcash", "easypaisa"]);

const proofSchema = z.object({
  orderNumber: z.string().min(6).max(32),
  accessToken: z.string().min(16).max(128),
  trxId: z
    .string()
    .trim()
    .min(4, "Enter the transaction ID (TID / TrxID)")
    .max(64, "Transaction ID looks too long")
    .regex(/^[A-Za-z0-9-]+$/, "TID can only contain letters, numbers and dashes"),
});

/**
 * Customer submits JazzCash TID (or legacy EasyPaisa TrxID) after Send Money.
 * Never marks paid — seller confirms the ID in their JazzCash app first.
 */
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimitAsync(`payment-proof:${ip}`, { maxAttempts: 10 });
    if (!limit.allowed) {
      return jsonError("Too many attempts. Please wait a moment.", 429);
    }

    const body = await request.json();
    const parsed = proofSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues?.[0]?.message || "Invalid transaction ID", 400);
    }

    const { orderNumber, accessToken, trxId } = parsed.data;

    await connectDB();
    const order = await Order.findOne({ orderNumber, accessToken });
    if (!order) return jsonError("Order not found", 404);

    if (!MANUAL_WALLET_METHODS.has(order.paymentMethod)) {
      return jsonError("This order does not use JazzCash / wallet payment", 400);
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
      paymentMethod: { $in: [...MANUAL_WALLET_METHODS] },
      _id: { $ne: order._id },
    });

    order.paymentReference = trxId;
    order.paymentStatus = "pending";
    order.orderStatus = "payment_review";
    order.paymentGatewayResponse = {
      ...(order.paymentGatewayResponse || {}),
      type: "manual_jazzcash",
      trxId,
      submittedAt: new Date().toISOString(),
      submittedIp: ip,
      reusedTrxId: !!duplicate,
    };
    await order.save();

    sendTidReceivedEmail(order.toObject()).catch(() => {});

    return jsonSuccess({
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trxId,
      duplicateWarning: duplicate
        ? "This TID is already used on another order — verification may take longer."
        : null,
      message: "Transaction ID submitted. Verification usually takes a few minutes.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
