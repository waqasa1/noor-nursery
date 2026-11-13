import mongoose from "mongoose";
import Bundle from "@/models/Bundle";
import Product from "@/models/Product";
import { isRealCatalogImage } from "@/lib/catalog/images";
import { maxBundlesFromStock } from "@/lib/bundles/stock";

function isMongoId(id) {
  return (
    typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
}

/**
 * Load a bundle and resolve each content line against live product/variant data.
 * Returns null if the bundle doc is missing.
 */
export async function resolveBundleContents(bundleDoc) {
  if (!bundleDoc) return null;

  const productIds = [...new Set((bundleDoc.items || []).map((i) => String(i.productId)))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const contents = [];
  const errors = [];

  for (const row of bundleDoc.items || []) {
    const productId = row.productId?.toString?.() || String(row.productId);
    const variantId = row.variantId?.toString?.() || String(row.variantId);
    const quantity = Number(row.quantity) || 1;
    const product = byId.get(productId);

    if (!product || !product.isActive) {
      errors.push("One of the items in this bundle is no longer available.");
      continue;
    }

    const variant = (product.variants || []).find(
      (v) => v._id.toString() === variantId && v.isActive
    );
    if (!variant) {
      errors.push(`${product.nameEn}: that size is no longer available in this bundle.`);
      continue;
    }

    const image =
      (isRealCatalogImage(variant.image) && variant.image) ||
      product.featuredImage ||
      product.images?.[0] ||
      "";

    contents.push({
      productId,
      productSlug: product.slug,
      variantId,
      nameEn: product.nameEn,
      nameUr: product.nameUr || "",
      size: variant.size,
      sizeLabelEn: variant.sizeLabelEn,
      sizeLabelUr: variant.sizeLabelUr || "",
      sku: variant.sku || "",
      image,
      catalogPrice: variant.price,
      quantity,
      stock: variant.stock,
    });
  }

  const coverImage =
    (isRealCatalogImage(bundleDoc.image) && bundleDoc.image) ||
    contents.find((c) => isRealCatalogImage(c.image))?.image ||
    contents[0]?.image ||
    "";

  const partsTotal = contents.reduce(
    (sum, c) => sum + Number(c.catalogPrice || 0) * Number(c.quantity || 0),
    0
  );

  return {
    bundle: bundleDoc,
    contents,
    errors,
    coverImage,
    partsTotal,
    maxStock: maxBundlesFromStock(contents),
    available: errors.length === 0 && contents.length === (bundleDoc.items || []).length,
  };
}

/**
 * Hydrate active bundles for storefront cards (list / PDP suggestions).
 */
export async function hydrateBundles(bundleDocs) {
  const results = [];
  for (const doc of bundleDocs || []) {
    const resolved = await resolveBundleContents(doc);
    if (!resolved?.available) continue;
    results.push(serializeResolvedBundle(resolved));
  }
  return results;
}

export function serializeResolvedBundle(resolved) {
  const b = resolved.bundle;
  return {
    _id: b._id.toString(),
    nameEn: b.nameEn,
    nameUr: b.nameUr || "",
    slug: b.slug,
    descriptionEn: b.descriptionEn || "",
    descriptionUr: b.descriptionUr || "",
    image: resolved.coverImage || "/placeholder-plant.jpg",
    price: b.price,
    partsTotal: resolved.partsTotal,
    maxStock: resolved.maxStock,
    isActive: b.isActive,
    sortOrder: b.sortOrder ?? 0,
    items: resolved.contents.map((c) => ({
      productId: c.productId,
      productSlug: c.productSlug,
      variantId: c.variantId,
      nameEn: c.nameEn,
      nameUr: c.nameUr,
      size: c.size,
      sizeLabelEn: c.sizeLabelEn,
      sizeLabelUr: c.sizeLabelUr,
      quantity: c.quantity,
      catalogPrice: c.catalogPrice,
      image: c.image || "",
      stock: c.stock,
    })),
  };
}

/**
 * Validate bundle lines from the cart against live catalog data.
 * Never trust client-provided prices.
 */
export async function validateBundleItems(items) {
  if (!items?.length) {
    return { valid: true, errors: [], validatedItems: [], unavailableKeys: [] };
  }

  const errors = [];
  const validatedItems = [];
  const unavailableKeys = [];

  for (const item of items) {
    const label = String(item?.nameEn || "").trim() || "A bundle in your cart";
    const key = `bundle:${item.bundleId}`;

    if (!isMongoId(item.bundleId)) {
      errors.push(`${label} is no longer available. Remove it and add the bundle again.`);
      unavailableKeys.push(key);
      continue;
    }

    let bundle;
    try {
      bundle = await Bundle.findById(item.bundleId).lean();
    } catch {
      errors.push(`${label} is no longer available. Remove it and add the bundle again.`);
      unavailableKeys.push(key);
      continue;
    }

    if (!bundle || !bundle.isActive) {
      errors.push(`${label} is no longer available. Remove it from your cart.`);
      unavailableKeys.push(key);
      continue;
    }

    const resolved = await resolveBundleContents(bundle);
    if (!resolved.available) {
      errors.push(
        resolved.errors[0] ||
          `${bundle.nameEn} can no longer be purchased. Remove it from your cart.`
      );
      unavailableKeys.push(key);
      continue;
    }

    const quantity = Number(item.quantity) || 1;
    if (resolved.maxStock < quantity) {
      if (resolved.maxStock <= 0) {
        errors.push(`${bundle.nameEn} is out of stock.`);
      } else {
        errors.push(
          `${bundle.nameEn}: only ${resolved.maxStock} left in stock. Lower the quantity.`
        );
      }
      continue;
    }

    validatedItems.push({
      lineType: "bundle",
      type: "bundle",
      bundleId: bundle._id.toString(),
      productId: bundle._id.toString(),
      productSlug: bundle.slug,
      variantId: bundle._id.toString(),
      nameEn: bundle.nameEn,
      nameUr: bundle.nameUr || "",
      size: "bundle",
      sizeLabelEn: "Bundle",
      sizeLabelUr: "",
      sku: `BUNDLE-${bundle.slug}`.slice(0, 64),
      image: resolved.coverImage || "",
      unitPrice: bundle.price,
      quantity,
      lineTotal: bundle.price * quantity,
      stock: resolved.maxStock,
      bundleContents: resolved.contents.map((c) => ({
        productId: c.productId,
        productSlug: c.productSlug,
        variantId: c.variantId,
        nameEn: c.nameEn,
        nameUr: c.nameUr,
        size: c.size,
        sizeLabelEn: c.sizeLabelEn,
        sizeLabelUr: c.sizeLabelUr,
        sku: c.sku,
        image: c.image,
        quantity: c.quantity,
        catalogPrice: c.catalogPrice,
      })),
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    validatedItems,
    unavailableKeys,
  };
}
