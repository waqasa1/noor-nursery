/** Local seed/fallback assets that should never appear in a real product gallery. */
const PLACEHOLDER_RE = /^\/placeholder(-plant)?\.jpg$/i;

export function isCatalogPlaceholder(url) {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_RE.test(trimmed);
}

export function isRealCatalogImage(url) {
  return !isCatalogPlaceholder(url);
}

/** Dedupe and drop placeholders from one or more URL lists. */
export function uniqueRealImages(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const url of list || []) {
      if (!isRealCatalogImage(url) || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

/**
 * Featured + gallery + active variant photos for the PDP.
 * Size photos are included so switching sizes can show the matching image.
 */
export function buildProductGallery(product) {
  const variantImages = (product?.variants || [])
    .filter((v) => v?.isActive !== false)
    .map((v) => v.image);

  return uniqueRealImages([product?.featuredImage], product?.images, variantImages);
}
