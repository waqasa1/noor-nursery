import { connectDB, isDBConfigured } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { jsonSuccess, handleApiError } from "@/lib/api-response";
import { applyProductSearch } from "@/lib/products/search";
import { applyVariantShopFilters } from "@/lib/products/filters";

export async function GET(request) {
  try {
    if (!isDBConfigured()) {
      return jsonSuccess({ products: [], pagination: { page: 1, total: 0, pages: 0 } });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(96, parseInt(searchParams.get("limit") || "12", 10));
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const available = searchParams.get("available");

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

    if (featured === "true") filter.featured = true;

    applyVariantShopFilters(filter, { minPrice, maxPrice, available });
    Object.assign(filter, applyProductSearch({}, search));

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { "variants.0.price": 1 };
    if (sort === "price_desc") sortOption = { "variants.0.price": -1 };
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

    return jsonSuccess({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
