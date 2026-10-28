import {
  getBannerConfig,
  getSiteContent,
  getStoreInfo,
  getDeliveryConfig,
  getTestimonials,
} from "@/lib/settings";
import { getStoreFaqs } from "@/lib/faqs.server";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export const revalidate = 60; // revalidate every 60 seconds

export async function GET() {
  try {
    const [banner, site_content, store, delivery, testimonials, faqs] = await Promise.all([
      getBannerConfig(),
      getSiteContent(),
      getStoreInfo(),
      getDeliveryConfig(),
      getTestimonials(),
      getStoreFaqs(),
    ]);
    return jsonSuccess({
      banner,
      site_content,
      store,
      delivery: { freeThreshold: delivery.freeThreshold },
      testimonials,
      faqs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
