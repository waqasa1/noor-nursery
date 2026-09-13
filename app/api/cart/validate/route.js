import { z } from "zod";
import { connectDB, isDBConfigured } from "@/lib/db";
import { validateCartItems, buildCartSummary } from "@/lib/cart/validation";
import { calculateDeliveryFeeAsync } from "@/lib/delivery";
import { validatePromoCode } from "@/lib/promo";
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
  promoCode: z.string().optional(),
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
    const deliveryFee = await calculateDeliveryFeeAsync(parsed.data.city, subtotal);

    let discount = 0;
    let promo = null;
    if (parsed.data.promoCode) {
      const promoResult = await validatePromoCode(parsed.data.promoCode, subtotal);
      if (promoResult.valid) {
        discount = promoResult.discount;
        promo = { code: promoResult.promoCode, label: promoResult.label, discount };
      } else {
        promo = { error: promoResult.error };
      }
    }

    const totals = buildCartSummary(validatedItems, deliveryFee, discount);

    return jsonSuccess({ valid, errors, items: validatedItems, totals, promo });
  } catch (error) {
    return handleApiError(error);
  }
}
