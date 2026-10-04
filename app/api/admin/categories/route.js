import { z } from "zod";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const categorySchema = z.object({
  nameEn: z.string().min(1),
  nameUr: z.string().min(1),
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

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();
    const type = new URL(request.url).searchParams.get("type");
    const filter = type ? { type } : {};
    const [categories, counts] = await Promise.all([
      Category.find(filter).sort({ sortOrder: 1, nameEn: 1 }).lean(),
      Product.aggregate([
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ]),
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    return jsonSuccess({
      categories: categories.map((c) => ({
        ...c,
        productCount: countMap[String(c._id)] || 0,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const slug = parsed.data.slug || slugify(parsed.data.nameEn);
    const category = await Category.create({ ...parsed.data, slug });
    return jsonSuccess({ category }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
