import { connectDB, isDBConfigured } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request) {
  try {
    if (!isDBConfigured()) {
      return jsonSuccess({ products: [], pagination: { page: 1, total: 0, pages: 0 } });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(48, parseInt(searchParams.get("limit") || "12", 10));
    const category = searchParams.get("category");
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

    if (featured === "true") filter.featured = true;

    if (search) {
      filter.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { "variants.0.price": 1 };
    if (sort === "price_desc") sortOption = { "variants.0.price": -1 };
    if (sort === "featured") sortOption = { featured: -1, createdAt: -1 };

    const skip = (page - 1) * limit;
    let products = await Product.find(filter)
      .populate("categoryId", "nameEn nameUr slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    if (available === "true") {
      products = products.filter((p) =>
        p.variants?.some((v) => v.isActive && v.stock > 0)
      );
    }

    if (minPrice || maxPrice) {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Infinity;
      products = products.filter((p) => {
        const prices = p.variants?.filter((v) => v.isActive).map((v) => v.price) || [];
        const lowest = Math.min(...prices);
        return lowest >= min && lowest <= max;
      });
    }

    const total = await Product.countDocuments(filter);

    return jsonSuccess({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
