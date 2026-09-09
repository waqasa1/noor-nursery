import { connectDB, isDBConfigured } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function getFeaturedProducts(limit = 8) {
  if (!isDBConfigured()) return [];
  await connectDB();
  return Product.find({ isActive: true, featured: true })
    .populate("categoryId", "nameEn nameUr slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getProductBySlug(slug) {
  if (!isDBConfigured()) return null;
  await connectDB();
  return Product.findOne({ slug, isActive: true })
    .populate("categoryId", "nameEn nameUr slug")
    .lean();
}

export async function getProducts(filters = {}) {
  if (!isDBConfigured()) return { products: [], total: 0 };
  await connectDB();

  const {
    page = 1,
    limit = 12,
    category,
    search,
    featured,
    sort = "newest",
  } = filters;

  const filter = { isActive: true };
  if (category) {
    const cat = await Category.findOne({ slug: category, isActive: true }).lean();
    if (cat) filter.categoryId = cat._id;
  }
  if (featured) filter.featured = true;
  if (search) filter.$text = { $search: search };

  let sortOption = { createdAt: -1 };
  if (sort === "featured") sortOption = { featured: -1, createdAt: -1 };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "nameEn nameUr slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total, pages: Math.ceil(total / limit) };
}

export async function getRelatedProducts(categoryId, excludeId, limit = 4) {
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

export async function getCategories() {
  if (!isDBConfigured()) return [];
  await connectDB();
  return Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
}

export async function getCategoryBySlug(slug) {
  if (!isDBConfigured()) return null;
  await connectDB();
  return Category.findOne({ slug, isActive: true }).lean();
}
