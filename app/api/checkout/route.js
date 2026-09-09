import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createOrder } from "@/lib/orders/create";
import { getAvailablePaymentMethods } from "@/lib/payments";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  area: z.string().min(2),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().optional(),
  country: z.string().default("Pakistan"),
  deliveryInstructions: z.string().optional(),
});

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().min(1).max(20),
    })
  ).min(1),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
  }),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["cod", "bank_transfer", "jazzcash", "easypaisa", "payfast"]),
  customerNote: z.string().max(500).optional(),
  agreeToTerms: z.literal(true),
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`checkout:${ip}`, { maxAttempts: 10 });
    if (!limit.allowed) {
      return jsonError("Too many checkout attempts. Please wait.", 429);
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const available = getAvailablePaymentMethods().map((m) => m.id);
    if (!available.includes(parsed.data.paymentMethod)) {
      return jsonError("Selected payment method is not available", 400);
    }

    const session = await getSession();
    const result = await createOrder({
      ...parsed.data,
      userId: session?.userId,
    });

    if (!result.success) {
      return jsonError("Unable to place order", 400, result.errors);
    }

    return jsonSuccess({
      order: {
        orderNumber: result.order.orderNumber,
        total: result.order.total,
        paymentMethod: result.order.paymentMethod,
      },
      payment: result.payment,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
