import { z } from "zod";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const categoryUpdateSchema = z.object({
  nameEn: z.string().min(1).optional(),
  nameUr: z.string().min(1).optional(),
  slug: z.string().optional(),
  type: z.enum(["plant", "accessory"]).optional(),
  descriptionEn: z.string().optional(),
  descriptionUr: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const category = await Category.findById(id).lean();
    if (!category) return jsonError("Category not found", 404);
    return jsonSuccess({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const parsed = categoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const update = { ...parsed.data };
    // Only rewrite the slug when the form explicitly sends one (empty = regenerate).
    if (typeof update.slug === "string") {
      update.slug = update.slug ? update.slug.toLowerCase() : slugify(update.nameEn || "");
      if (!update.slug) delete update.slug;
    }

    const category = await Category.findByIdAndUpdate(id, update, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!category) return jsonError("Category not found", 404);

    return jsonSuccess({ category });
  } catch (error) {
    if (error?.code === 11000) return jsonError("That slug is already in use", 400);
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    const category = await Category.findById(id);
    if (!category) return jsonError("Category not found", 404);

    const inUse = await Product.countDocuments({ categoryId: category._id });
    if (inUse > 0) {
      return jsonError(
        `Cannot delete — ${inUse} product${inUse === 1 ? "" : "s"} still use this category. Reassign or archive them first.`,
        400
      );
    }

    await category.deleteOne();
    return jsonSuccess({ message: "Category deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
