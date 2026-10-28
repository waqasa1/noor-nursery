import { z } from "zod";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { rateLimitAsync, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";
import { orderSuccessPath } from "@/lib/orders/access";
import { isManualWalletPayment } from "@/lib/payments/methods";

const schema = z
  .object({
    orderNumber: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
  })
  .refine((d) => Boolean(d.email?.trim()) || Boolean(d.phone?.trim()), {
    message: "Email or phone required",
  });

const GENERIC_NOT_FOUND =
  "We could not find an order with those details. Check the order number and the email or phone used at checkout.";

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function phonesMatch(stored, input) {
  const a = digitsOnly(stored);
  const b = digitsOnly(input);
  if (!a || !b) return false;
  const aTail = a.slice(-10);
  const bTail = b.slice(-10);
  return aTail === bTail || a.endsWith(b) || b.endsWith(a);
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimitAsync(`track:${ip}`, { maxAttempts: 20, windowMs: 15 * 60 * 1000 });
    if (!limit.allowed) {
      return jsonError("Too many lookup attempts. Please wait.", 429);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Please provide order number and email or phone", 400);
    }

    const orderNumber = parsed.data.orderNumber.trim().toUpperCase();
    const email = parsed.data.email?.trim().toLowerCase() || "";
    const phone = parsed.data.phone?.trim() || "";

    await connectDB();

    // Look up by order number only, then verify contact privately so we never
    // leak whether an order exists when the email/phone is wrong.
    const order = await Order.findOne({ orderNumber })
      .select(
        "orderNumber accessToken orderStatus paymentStatus paymentMethod paymentReference total createdAt updatedAt items customer shippingAddress"
      )
      .lean();

    if (!order) {
      return jsonError(GENERIC_NOT_FOUND, 404);
    }

    const emailOk = email && order.customer?.email?.toLowerCase() === email;
    const phoneOk = phone && phonesMatch(order.customer?.phone, phone);
    if (!emailOk && !phoneOk) {
      return jsonError(GENERIC_NOT_FOUND, 404);
    }

    const needsPaymentAction =
      isManualWalletPayment(order.paymentMethod) &&
      order.paymentStatus !== "paid" &&
      Boolean(order.accessToken);

    const safeOrder = {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: (order.items || []).map((item) => ({
        nameEn: item.nameEn,
        quantity: item.quantity,
        sizeLabelEn: item.sizeLabelEn,
      })),
      customerName: order.customer?.name || "",
      deliveryCity: order.shippingAddress?.city || "",
      hasPaymentTid: Boolean(order.paymentReference),
      // Internal status only — no live courier GPS / tracking number yet.
      trackingKind: "order_status",
      paymentActionUrl: needsPaymentAction
        ? orderSuccessPath(order.orderNumber, order.accessToken)
        : null,
    };

    return jsonSuccess({ order: safeOrder });
  } catch (error) {
    return handleApiError(error);
  }
}
