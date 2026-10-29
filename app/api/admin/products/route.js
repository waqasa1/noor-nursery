import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";
import { revalidateCatalog } from "@/lib/cache/catalog";
import { sanitizeProductImageFields } from "@/lib/catalog/sanitize-product-images";
import { productWriteSchema } from "@/lib/validation/product";
import { applyProductSearch } from "@/lib/products/search";

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(200, parseInt(searchParams.get("limit") || "60", 10));
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    const filter = applyProductSearch({}, search);

    if (type === "plant" || type === "accessory") {
      const cats = await Category.find({ type }).select("_id").lean();
      filter.categoryId = { $in: cats.map((c) => c._id) };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "nameEn slug type")
        .sort({ nameEn: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return jsonSuccess({ products, pagination: { page, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = productWriteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const slug = parsed.data.slug || slugify(parsed.data.nameEn);
    const existing = await Product.findOne({ slug });
    if (existing) return jsonError("Slug already exists", 400);

    const product = await Product.create({ ...sanitizeProductImageFields(parsed.data), slug });
    revalidateCatalog({ slug });
    return jsonSuccess({ product }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
