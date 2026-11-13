import { unstable_cache } from "next/cache";
import { connectDB, isDBConfigured } from "@/lib/db";
import Bundle from "@/models/Bundle";
import { CATALOG_CACHE_TAG } from "@/lib/cache/catalog";
import { hydrateBundles, resolveBundleContents, serializeResolvedBundle } from "@/lib/bundles/resolve";

const cacheOpts = { tags: [CATALOG_CACHE_TAG], revalidate: false };

async function fetchActiveBundles() {
  if (!isDBConfigured()) return [];
  await connectDB();
  const docs = await Bundle.find({ isActive: true }).sort({ sortOrder: 1, nameEn: 1 }).lean();
  return hydrateBundles(docs);
}

async function fetchBundleBySlug(slug) {
  if (!isDBConfigured() || !slug) return null;
  await connectDB();
  const doc = await Bundle.findOne({ slug, isActive: true }).lean();
  if (!doc) return null;
  const resolved = await resolveBundleContents(doc);
  if (!resolved?.available) return null;
  return serializeResolvedBundle(resolved);
}

async function fetchBundlesForProduct(productId) {
  if (!isDBConfigured() || !productId) return [];
  await connectDB();
  const docs = await Bundle.find({
    isActive: true,
    "items.productId": productId,
  })
    .sort({ sortOrder: 1, nameEn: 1 })
    .limit(6)
    .lean();
  return hydrateBundles(docs);
}

export function getActiveBundles() {
  return unstable_cache(() => fetchActiveBundles(), ["active-bundles-v1"], cacheOpts)();
}

export function getBundleBySlug(slug) {
  return unstable_cache(
    () => fetchBundleBySlug(slug),
    ["bundle-by-slug-v1", String(slug)],
    cacheOpts
  )();
}

export function getBundlesForProduct(productId) {
  return unstable_cache(
    () => fetchBundlesForProduct(productId),
    ["bundles-for-product-v1", String(productId)],
    cacheOpts
  )();
}
