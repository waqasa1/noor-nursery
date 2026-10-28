import { getBannerConfig, getSiteContent, getStoreInfo } from "@/lib/settings";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export const revalidate = 60; // revalidate every 60 seconds

export async function GET() {
  try {
    const [banner, site_content, store] = await Promise.all([
      getBannerConfig(),
      getSiteContent(),
      getStoreInfo(),
    ]);
    return jsonSuccess({ banner, site_content, store });
  } catch (error) {
    return handleApiError(error);
  }
}

