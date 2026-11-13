import { connectDB } from "@/lib/db";
import Bundle from "@/models/Bundle";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";
import { revalidateCatalog } from "@/lib/cache/catalog";
import { bundleUpdateSchema } from "@/lib/validation/bundle";

async function assertBundleItemsExist(items) {
  if (!items) return null;
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

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const bundle = await Bundle.findById(id)
      .populate("items.productId", "nameEn nameUr featuredImage variants")
      .lean();
    if (!bundle) return jsonError("Bundle not found", 404);
    return jsonSuccess({ bundle });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = bundleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const existing = await Bundle.findById(id);
    if (!existing) return jsonError("Bundle not found", 404);

    if (parsed.data.items) {
      const itemError = await assertBundleItemsExist(parsed.data.items);
      if (itemError) return jsonError(itemError, 400);
    }

    const next = { ...parsed.data };
    if (next.nameEn && !next.slug && !body.slug) {
      // keep existing slug unless explicitly provided
    }
    if (body.slug != null || (next.slug && next.slug !== existing.slug)) {
      const slug = slugify(next.slug || next.nameEn || existing.nameEn);
      if (!slug) return jsonError("Enter a valid slug", 400);
      const clash = await Bundle.findOne({ slug, _id: { $ne: id } });
      if (clash) return jsonError("Slug already exists", 400);
      next.slug = slug;
    }

    Object.assign(existing, next);
    await existing.save();
    revalidateCatalog({ bundleSlug: existing.slug });
    return jsonSuccess({ bundle: existing.toObject() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();
    const bundle = await Bundle.findById(id);
    if (!bundle) return jsonError("Bundle not found", 404);

    const slug = bundle.slug;
    bundle.isActive = false;
    await bundle.save();
    revalidateCatalog({ bundleSlug: slug });
    return jsonSuccess({ archived: id });
  } catch (error) {
    return handleApiError(error);
  }
}
