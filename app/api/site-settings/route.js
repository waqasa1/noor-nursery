import {
  getBannerConfig,
  getSiteContent,
  getStoreInfo,
  getDeliveryConfig,
  getTestimonials,
} from "@/lib/settings";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export const revalidate = 60; // revalidate every 60 seconds

export async function GET() {
  try {
    const [banner, site_content, store, delivery, testimonials] = await Promise.all([
      getBannerConfig(),
      getSiteContent(),
      getStoreInfo(),
      getDeliveryConfig(),
      getTestimonials(),
    ]);
    return jsonSuccess({
      banner,
      site_content,
      store,
      delivery: { freeThreshold: delivery.freeThreshold },
      testimonials,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
