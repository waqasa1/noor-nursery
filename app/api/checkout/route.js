import { getSession } from "@/lib/auth/session";
import { createOrder } from "@/lib/orders/create";
import { getAvailablePaymentMethodsAsync } from "@/lib/payments";
import { getDeliveryConfig } from "@/lib/settings";
import { cityOptionsFromFees } from "@/lib/delivery-defaults";
import { rateLimitAsync, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";
import { checkoutSchema, mapCheckoutFieldErrors } from "@/lib/validation/checkout";

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimitAsync(`checkout:${ip}`, { maxAttempts: 10 });
    if (!limit.allowed) {
      return jsonError("Too many checkout attempts. Please wait.", 429);
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, mapCheckoutFieldErrors(parsed.error));
    }

    const available = (await getAvailablePaymentMethodsAsync()).map((m) => m.id);
    if (!available.includes(parsed.data.paymentMethod)) {
      return jsonError("Selected payment method is not available", 400);
    }

    const session = await getSession();
    const result = await createOrder({
      ...parsed.data,
      userId: session?.userId,
    });

    if (!result.success) {
      const detail = Array.isArray(result.errors)
        ? result.errors[0]
        : "Unable to place order";
      return jsonError(detail || "Unable to place order", 400, result.errors);
    }

    return jsonSuccess({
      order: {
        orderNumber: result.order.orderNumber,
        total: result.order.total,
        paymentMethod: result.order.paymentMethod,
        accessToken: result.order.accessToken,
      },
      payment: result.payment,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  const [paymentMethods, delivery] = await Promise.all([
    getAvailablePaymentMethodsAsync(),
    getDeliveryConfig(),
  ]);
  return jsonSuccess({
    paymentMethods,
    delivery: {
      defaultFee: delivery.defaultFee,
      freeThreshold: delivery.freeThreshold,
      cities: cityOptionsFromFees(delivery.cityFees),
    },
  });
}
