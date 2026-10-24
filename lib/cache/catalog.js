import { revalidatePath, revalidateTag } from "next/cache";

/** Shared Next.js cache tag for product/category catalog reads. */
export const CATALOG_CACHE_TAG = "catalog";

/**
 * Bust storefront catalog cache after admin writes or seed.
 * Safe to call from Route Handlers / Server Actions only.
 */
export function revalidateCatalog({ slug } = {}) {
  revalidateTag(CATALOG_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/categories");
  revalidatePath("/faq");
  if (slug) revalidatePath(`/products/${slug}`);
}
