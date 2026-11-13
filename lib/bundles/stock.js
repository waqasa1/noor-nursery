/**
 * Flatten validated cart lines into product+variant stock movements.
 * Bundles expand into their contents × bundle quantity.
 * Duplicate product/variant pairs are summed.
 */
export function expandItemsForStock(validatedItems) {
  const map = new Map();

  for (const item of validatedItems || []) {
    if (item.lineType === "bundle") {
      for (const content of item.bundleContents || []) {
        const key = `${content.productId}:${content.variantId}`;
        const qty = Number(content.quantity || 0) * Number(item.quantity || 0);
        if (qty <= 0) continue;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += qty;
        } else {
          map.set(key, {
            productId: content.productId,
            variantId: content.variantId,
            quantity: qty,
            nameEn: content.nameEn || item.nameEn || "Bundle item",
          });
        }
      }
      continue;
    }

    const key = `${item.productId}:${item.variantId}`;
    const qty = Number(item.quantity || 0);
    if (qty <= 0) continue;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += qty;
    } else {
      map.set(key, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: qty,
        nameEn: item.nameEn || "Item",
      });
    }
  }

  return [...map.values()];
}

/** How many complete bundles can be fulfilled from current variant stock. */
export function maxBundlesFromStock(contents) {
  if (!contents?.length) return 0;
  let max = Infinity;
  for (const c of contents) {
    const need = Number(c.quantity) || 0;
    const stock = Number(c.stock) || 0;
    if (need <= 0) return 0;
    max = Math.min(max, Math.floor(stock / need));
  }
  return Number.isFinite(max) ? max : 0;
}
