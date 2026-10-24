import { requireAdmin } from "@/lib/auth/session";
import { revalidateCatalog } from "@/lib/cache/catalog";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

/** Bust storefront catalog cache (call after seed or bulk image attach). */
export async function POST() {
  try {
    await requireAdmin();
    revalidateCatalog();
    return jsonSuccess({ revalidated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
