/**
 * Escape a string for safe use inside a RegExp.
 */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SEARCH_FIELDS = [
  "nameEn",
  "nameUr",
  "slug",
  "shortDescriptionEn",
  "shortDescriptionUr",
  "tags",
  "variants.sku",
  "variants.sizeLabelEn",
  "variants.sizeLabelUr",
];

/**
 * Partial / fuzzy-ish product search (substring match).
 * "ur" matches "Urea", "neem oil" requires both tokens somewhere in the product.
 * Returns a Mongo filter clause, or null if the query is empty.
 */
export function buildProductSearchFilter(rawQuery) {
  const q = String(rawQuery || "").trim();
  if (!q) return null;

  const tokens = q
    .split(/[\s,+/|_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 8);

  if (!tokens.length) return null;

  const tokenClauses = tokens.map((token) => {
    const rx = new RegExp(escapeRegex(token), "i");
    return {
      $or: SEARCH_FIELDS.map((field) => ({ [field]: rx })),
    };
  });

  return tokenClauses.length === 1 ? tokenClauses[0] : { $and: tokenClauses };
}

/** Merge a search clause into an existing product filter. */
export function applyProductSearch(filter, rawQuery) {
  const clause = buildProductSearchFilter(rawQuery);
  if (!clause) return filter;
  return { ...filter, ...clause };
}
