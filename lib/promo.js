import { getPromoCodes } from "@/lib/settings";

export async function validatePromoCode(code, subtotal) {
  if (!code?.trim()) {
    return { valid: false, discount: 0, error: "Enter a promo code" };
  }

  const normalized = code.trim().toUpperCase();
  const promos = await getPromoCodes();
  const promo = Object.values(promos).find(
    (p) => p.active && p.code?.toUpperCase() === normalized
  );

  if (!promo) {
    return { valid: false, discount: 0, error: "Invalid or expired promo code" };
  }

  if (subtotal < (promo.minSubtotal || 0)) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order of PKR ${promo.minSubtotal} required for this code`,
    };
  }

  let discount = 0;
  if (promo.type === "percent") {
    discount = Math.round(subtotal * (promo.value / 100));
  } else if (promo.type === "fixed") {
    discount = Math.min(promo.value, subtotal);
  }

  return {
    valid: true,
    discount,
    promoCode: promo.code,
    label: promo.label || promo.code,
  };
}
