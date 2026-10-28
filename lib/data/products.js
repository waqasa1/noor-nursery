import { unstable_cache } from "next/cache";
import { connectDB, isDBConfigured } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { CATALOG_CACHE_TAG } from "@/lib/cache/catalog";
import { applyProductSearch } from "@/lib/products/search";

const cacheOpts = { tags: [CATALOG_CACHE_TAG], revalidate: false };

async function fetchFeaturedProducts(limit) {
  if (!isDBConfigured()) return [];
  await connectDB();

  const plantCats = await Category.find({ type: "plant", isActive: true }).select("_id").lean();
  const filter = { isActive: true, featured: true };
  if (plantCats.length) filter.categoryId = { $in: plantCats.map((c) => c._id) };

  return Product.find(filter)
    .populate("categoryId", "nameEn nameUr slug type")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function fetchProductBySlug(slug) {
  if (!isDBConfigured()) return null;
  await connectDB();
  return Product.findOne({ slug, isActive: true })
    .populate("categoryId", "nameEn nameUr slug type")
    .lean();
}

async function fetchProducts(filters = {}) {
  if (!isDBConfigured()) return { products: [], total: 0, pages: 0 };
  await connectDB();

  const {
    page = 1,
    limit = 12,
    category,
    type,
    search,
    featured,
    sort = "newest",
  } = filters;

  const filter = { isActive: true };
  if (category) {
    const cat = await Category.findOne({ slug: category, isActive: true }).lean();
    if (cat) filter.categoryId = cat._id;
  }
  if (type === "accessories" || type === "plants") {
    const wanted = type === "accessories" ? "accessory" : "plant";
    const cats = await Category.find({ type: wanted, isActive: true }).lean();
    filter.categoryId = { $in: cats.map((c) => c._id) };
  }
  if (featured) filter.featured = true;
  Object.assign(filter, applyProductSearch({}, search));

  let sortOption = { createdAt: -1 };
  if (sort === "featured") sortOption = { featured: -1, createdAt: -1 };
  if (sort === "price_asc") sortOption = { "variants.0.price": 1 };
  if (sort === "price_desc") sortOption = { "variants.0.price": -1 };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "nameEn nameUr slug type")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total, pages: Math.ceil(total / limit) };
}

async function fetchRelatedProducts(categoryId, excludeId, limit) {
  if (!isDBConfigured()) return [];
  await connectDB();
  return Product.find({
    categoryId,
    isActive: true,
    _id: { $ne: excludeId },
  })
    .limit(limit)
    .lean();
}

async function fetchCategories() {
  if (!isDBConfigured()) return [];
  await connectDB();
  return Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
}

async function fetchCategoryBySlug(slug) {
  if (!isDBConfigured()) return null;
  await connectDB();
  return Category.findOne({ slug, isActive: true }).lean();
}

export function getFeaturedProducts(limit = 8) {
  return unstable_cache(
    () => fetchFeaturedProducts(limit),
    ["featured-products-v2", String(limit)],
    cacheOpts
  )();
}

export function getProductBySlug(slug) {
  return unstable_cache(
    () => fetchProductBySlug(slug),
    ["product-by-slug-v2", slug],
    cacheOpts
  )();
}

export function getProducts(filters = {}) {
  const key = JSON.stringify(filters);
  return unstable_cache(
    () => fetchProducts(filters),
    ["products-list-v3", key],
    cacheOpts
  )();
}

export function getRelatedProducts(categoryId, excludeId, limit = 4) {
  return unstable_cache(
    () => fetchRelatedProducts(String(categoryId), String(excludeId), limit),
    ["related-products", String(categoryId), String(excludeId), String(limit)],
    cacheOpts
  )();
}

export function getCategories() {
  return unstable_cache(() => fetchCategories(), ["categories"], cacheOpts)();
}

export function getCategoryBySlug(slug) {
  return unstable_cache(
    () => fetchCategoryBySlug(slug),
    ["category-by-slug", slug],
    cacheOpts
  )();
}
