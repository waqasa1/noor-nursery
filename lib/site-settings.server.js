import {
  getBannerConfig,
  getSiteContent,
  getStoreInfo,
  getDeliveryConfig,
  getTestimonials,
} from "@/lib/settings";
import { getStoreFaqs } from "@/lib/faqs.server";

/** Public storefront settings for SSR (banner, contact, testimonials, FAQs). */
export async function getPublicSiteSettings() {
  try {
    const [banner, site_content, store, delivery, testimonials, faqs] = await Promise.all([
      getBannerConfig(),
      getSiteContent(),
      getStoreInfo(),
      getDeliveryConfig(),
      getTestimonials(),
      getStoreFaqs(),
    ]);

    return {
      banner,
      site_content,
      store: { phone: store?.phone || "" },
      delivery: { freeThreshold: delivery?.freeThreshold ?? 2500 },
      testimonials,
      faqs,
    };
  } catch (error) {
    console.error("[site-settings] Failed to load:", error.message);
    return null;
  }
}
