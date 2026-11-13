/** Stable cart / checkout key for product and bundle lines. */
export function cartLineKey(item) {
  if (!item) return "";
  if (item.type === "bundle" || item.lineType === "bundle") {
    return `bundle:${item.bundleId}`;
  }
  return `product:${item.productId}:${item.variantId}`;
}

export function isBundleLine(item) {
  return item?.type === "bundle" || item?.lineType === "bundle";
}
