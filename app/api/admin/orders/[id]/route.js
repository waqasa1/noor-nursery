import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth/session";
import {
  sendOrderStatusUpdate,
  sendPaymentReceivedEmail,
  sendOrderConfirmationEmail,
  MILESTONE_STATUS_MESSAGES,
  formatOrderStatus,
} from "@/lib/email";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const updateSchema = z.object({
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentReference: z.string().max(64).optional(),
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
    const prevOrderStatus = order.orderStatus;

    if (parsed.data.orderStatus) order.orderStatus = parsed.data.orderStatus;
    if (parsed.data.paymentStatus) order.paymentStatus = parsed.data.paymentStatus;
    if (parsed.data.paymentReference !== undefined) {
      order.paymentReference = parsed.data.paymentReference.trim();
    }
    if (parsed.data.internalNote !== undefined) order.internalNote = parsed.data.internalNote;

    // Verifying a manual JazzCash (or legacy EasyPaisa) transfer clears payment states.
    if (
      parsed.data.paymentStatus === "paid" &&
      prevPaymentStatus !== "paid" &&
      ["awaiting_payment", "payment_review", "pending"].includes(order.orderStatus)
    ) {
      order.orderStatus = "paid";
    }

    const statusChanged =
      Boolean(parsed.data.orderStatus) && order.orderStatus !== prevOrderStatus;
    const milestoneMsg = MILESTONE_STATUS_MESSAGES[order.orderStatus];
    const shouldAutoNotify =
      statusChanged && Boolean(milestoneMsg) && !parsed.data.resendEmail;

    // Avoid double email if Save also flips payment→paid and status lands on a milestone
    // in the same request as payment received email.
    const paymentJustPaid =
      parsed.data.paymentStatus === "paid" && prevPaymentStatus !== "paid";

    if (shouldAutoNotify) {
      order.emailSent = { ...(order.emailSent || {}), statusUpdate: true };
    }

    await order.save();

    const lean = order.toObject();

    if (parsed.data.resendEmail) {
      const statusMsg =
        MILESTONE_STATUS_MESSAGES[order.orderStatus] ||
        `Your order status is now: ${formatOrderStatus(order.orderStatus)}.`;
      sendOrderStatusUpdate(lean, statusMsg)
        .then(() =>
          Order.findByIdAndUpdate(order._id, { "emailSent.statusUpdate": true }).catch(() => {})
        )
        .catch(() => {});
    } else if (shouldAutoNotify && !paymentJustPaid) {
      sendOrderStatusUpdate(lean, milestoneMsg).catch(() => {});
    }

    if (parsed.data.resendConfirmation) {
      sendOrderConfirmationEmail(lean).catch(() => {});
    }

    if (paymentJustPaid) {
      sendPaymentReceivedEmail(lean).catch(() => {});
    }

    return jsonSuccess({ order: lean });
  } catch (error) {
    return handleApiError(error);
  }
}
