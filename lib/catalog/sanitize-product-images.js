import { isCatalogPlaceholder, uniqueRealImages } from "@/lib/catalog/images";

/** Strip seed placeholders and keep featured + gallery + variant photos consistent. */
export function sanitizeProductImageFields(data) {
  const next = { ...data };

  if (next.images) {
    next.images = uniqueRealImages(next.images);
  }

  if (isCatalogPlaceholder(next.featuredImage)) {
    next.featuredImage = next.images?.[0] || "";
  } else if (next.featuredImage && next.images) {
    next.images = uniqueRealImages([next.featuredImage], next.images);
  }

  if (Array.isArray(next.variants)) {
    next.variants = next.variants.map((v) => ({
      ...v,
      image: isCatalogPlaceholder(v.image) ? "" : v.image,
    }));
  }

  return next;
}
