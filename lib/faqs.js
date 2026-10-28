import { FAQ_BASE } from "@/components/nursery/data";
import { formatPKR } from "@/lib/utils/currency";

/**
 * FAQ list with delivery threshold + active promo code from store settings.
 * Pure helper — safe for client components (no DB imports).
 */
export function buildFaqs({ freeThreshold = 2500, promoCode = "" } = {}) {
  const thresholdLabel = formatPKR(freeThreshold);
  const code = String(promoCode || "").trim().toUpperCase();

  const deliveryFaq = {
    q: "Is delivery free? What about promo codes?",
    a: code
      ? `Standard delivery is free on orders of ${thresholdLabel} or more (see the fee at checkout). Promo code ${code} gives a percentage discount on eligible carts when active — it is separate from free delivery.`
      : `Standard delivery is free on orders of ${thresholdLabel} or more (see the fee at checkout). Active promo codes shown on the storefront banner are separate from free delivery.`,
  };

  // Insert delivery FAQ after COD question (index 2)
  const faqs = [...FAQ_BASE];
  faqs.splice(3, 0, deliveryFaq);
  return faqs;
}
