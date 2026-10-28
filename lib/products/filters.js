/**
 * Apply price / availability filters onto a Mongo product query.
 * Uses $elemMatch so pagination stays accurate (unlike post-filtering).
 */
export function applyVariantShopFilters(filter, { minPrice, maxPrice, available } = {}) {
  const min =
    minPrice === "" || minPrice == null ? null : Number(minPrice);
  const max =
    maxPrice === "" || maxPrice == null ? null : Number(maxPrice);
  const wantAvailable = available === true || available === "true";

  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);
  if (!wantAvailable && !hasMin && !hasMax) return filter;

  const elem = { isActive: true };
  if (wantAvailable) elem.stock = { $gt: 0 };
  if (hasMin || hasMax) {
    elem.price = {};
    if (hasMin) elem.price.$gte = min;
    if (hasMax) elem.price.$lte = max;
  }

  filter.variants = { $elemMatch: elem };
  return filter;
}
