import { connectDB } from "@/lib/db";
import Bundle from "@/models/Bundle";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";
import { revalidateCatalog } from "@/lib/cache/catalog";
import { bundleWriteSchema } from "@/lib/validation/bundle";

async function assertBundleItemsExist(items) {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  for (const row of items) {
    const product = byId.get(row.productId);
    if (!product) {
      return `Product not found for one of the bundle items`;
    }
    const variant = (product.variants || []).find((v) => v._id.toString() === row.variantId);
    if (!variant) {
      return `${product.nameEn}: selected size was not found`;
    }
  }
  return null;
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const bundles = await Bundle.find({})
      .sort({ sortOrder: 1, nameEn: 1 })
      .populate("items.productId", "nameEn nameUr featuredImage variants")
      .lean();
    return jsonSuccess({ bundles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = bundleWriteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const itemError = await assertBundleItemsExist(parsed.data.items);
    if (itemError) return jsonError(itemError, 400);

    const slug = parsed.data.slug || slugify(parsed.data.nameEn);
    if (!slug) return jsonError("Enter a valid English name for the slug", 400);

    const existing = await Bundle.findOne({ slug });
    if (existing) return jsonError("Slug already exists", 400);

    const bundle = await Bundle.create({ ...parsed.data, slug });
    revalidateCatalog({ bundleSlug: slug });
    return jsonSuccess({ bundle }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
