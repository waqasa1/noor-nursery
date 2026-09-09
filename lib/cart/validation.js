import Product from "@/models/Product";
import { calculateOrderTotals } from "@/lib/utils/currency";

/**
 * Validate cart items against current product data.
 * Never trust client-provided prices or stock.
 */
export async function validateCartItems(items) {
  if (!items?.length) {
    return { valid: false, errors: ["Cart is empty"], validatedItems: [] };
  }

  const errors = [];
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId).lean();
    if (!product || !product.isActive) {
      errors.push(`Product unavailable: ${item.productId}`);
      continue;
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === item.variantId && v.isActive
    );
    if (!variant) {
      errors.push(`${product.nameEn}: selected size is no longer available`);
      continue;
    }

    if (variant.stock < item.quantity) {
      errors.push(
        `${product.nameEn} (${variant.sizeLabelEn}): only ${variant.stock} in stock`
      );
      continue;
    }

    validatedItems.push({
      productId: product._id.toString(),
      productSlug: product.slug,
      variantId: variant._id.toString(),
      nameEn: product.nameEn,
      nameUr: product.nameUr,
      size: variant.size,
      sizeLabelEn: variant.sizeLabelEn,
      sizeLabelUr: variant.sizeLabelUr || "",
      sku: variant.sku,
      image: variant.image || product.featuredImage || product.images?.[0] || "",
      unitPrice: variant.price,
      quantity: item.quantity,
      lineTotal: variant.price * item.quantity,
      stock: variant.stock,
    });
  }

  return {
    valid: errors.length === 0 && validatedItems.length > 0,
    errors,
    validatedItems,
  };
}

export function getStartingPrice(product) {
  const activeVariants = product.variants?.filter((v) => v.isActive && v.stock > 0) || [];
  if (!activeVariants.length) {
    const allActive = product.variants?.filter((v) => v.isActive) || [];
    if (!allActive.length) return null;
    return Math.min(...allActive.map((v) => v.price));
  }
  return Math.min(...activeVariants.map((v) => v.price));
}

export function getTotalStock(product) {
  return (
    product.variants?.filter((v) => v.isActive).reduce((sum, v) => sum + v.stock, 0) || 0
  );
}

export function buildCartSummary(validatedItems, deliveryFee = 0, discount = 0) {
  return calculateOrderTotals({ items: validatedItems, deliveryFee, discount });
}
