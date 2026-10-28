import { buildFaqs } from "@/lib/faqs";
import { getDeliveryConfig, getBannerConfig, getFaqsSetting } from "@/lib/settings";

/**
 * Resolved FAQ list for the storefront.
 * Uses Admin FAQs when configured; otherwise built-in defaults with live threshold/promo.
 */
export async function getStoreFaqs() {
  try {
    const stored = await getFaqsSetting();
    if (Array.isArray(stored)) {
      return stored.map((f) => ({
        id: f.id,
        q: f.q,
        a: f.a,
      }));
    }

    const [delivery, banner] = await Promise.all([
      getDeliveryConfig(),
      getBannerConfig(),
    ]);
    return buildFaqs({
      freeThreshold: delivery.freeThreshold,
      promoCode: banner.active ? banner.code : "",
    });
  } catch {
    return buildFaqs();
  }
}

/** Starter FAQs for the admin “Import defaults” action. */
export async function getDefaultFaqsForImport() {
  try {
    const [delivery, banner] = await Promise.all([
      getDeliveryConfig(),
      getBannerConfig(),
    ]);
    return buildFaqs({
      freeThreshold: delivery.freeThreshold,
      promoCode: banner.active ? banner.code : "",
    }).map((f, i) => ({
      id: `default-${Date.now()}-${i}`,
      q: f.q,
      a: f.a,
    }));
  } catch {
    return buildFaqs().map((f, i) => ({
      id: `default-${Date.now()}-${i}`,
      q: f.q,
      a: f.a,
    }));
  }
}
