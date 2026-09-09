import { z } from "zod";
import { connectDB, isDBConfigured } from "@/lib/db";
import { validateCartItems, buildCartSummary } from "@/lib/cart/validation";
import { calculateDeliveryFee } from "@/lib/delivery";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const schema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().min(1),
    })
  ),
  city: z.string().optional(),
});

export async function POST(request) {
  try {
    if (!isDBConfigured()) {
      return jsonError("Database not configured", 503);
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid cart data", 400);
    }

    await connectDB();
    const { valid, errors, validatedItems } = await validateCartItems(parsed.data.items);
    const subtotal = buildCartSummary(validatedItems).subtotal;
    const deliveryFee = calculateDeliveryFee(parsed.data.city, subtotal);
    const totals = buildCartSummary(validatedItems, deliveryFee);

    return jsonSuccess({ valid, errors, items: validatedItems, totals });
  } catch (error) {
    return handleApiError(error);
  }
}
