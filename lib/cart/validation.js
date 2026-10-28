import mongoose from "mongoose";
import Product from "@/models/Product";
import { calculateOrderTotals } from "@/lib/utils/currency";

function isMongoId(id) {
  return (
    typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
}

function itemLabel(item) {
  const name = String(item?.nameEn || "").trim();
  const size = String(item?.sizeLabelEn || "").trim();
  if (name && size) return `${name} (${size})`;
  if (name) return name;
  return "An item in your cart";
}

/**
 * Validate cart items against current product data.
 * Never trust client-provided prices or stock.
 * Error messages are customer-facing — never include database IDs.
 */
export async function validateCartItems(items) {
  if (!items?.length) {
    return { valid: false, errors: ["Your cart is empty"], validatedItems: [] };
  }

  const errors = [];
  const validatedItems = [];
  const unavailableKeys = [];

  for (const item of items) {
    const label = itemLabel(item);
    const key = `${item.productId}:${item.variantId}`;

    if (!isMongoId(item.productId) || !isMongoId(item.variantId)) {
      errors.push(`${label} is no longer available. Remove it and add the product again from the shop.`);
      unavailableKeys.push(key);
      continue;
    }

    let product;
    try {
      product = await Product.findById(item.productId).lean();
    } catch {
      errors.push(`${label} is no longer available. Remove it and add the product again from the shop.`);
      unavailableKeys.push(key);
      continue;
    }

    if (!product || !product.isActive) {
      errors.push(`${label} is no longer available. Remove it from your cart.`);
      unavailableKeys.push(key);
      continue;
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === item.variantId && v.isActive
    );
    if (!variant) {
      errors.push(
        `${product.nameEn}: that size is no longer available. Remove it and choose another size.`
      );
      unavailableKeys.push(key);
      continue;
    }

    if (variant.stock < item.quantity) {
      errors.push(
        `${product.nameEn} (${variant.sizeLabelEn}): only ${variant.stock} left in stock. Lower the quantity.`
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
    unavailableKeys,
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
