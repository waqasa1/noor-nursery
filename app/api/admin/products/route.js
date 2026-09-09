import { z } from "zod";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/utils/slug";
import { jsonSuccess, jsonError, handleApiError } from "@/lib/api-response";

const variantSchema = z.object({
  size: z.enum(["small", "medium", "large"]),
  sizeLabelEn: z.string(),
  sizeLabelUr: z.string().optional(),
  sku: z.string(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const productSchema = z.object({
  nameEn: z.string().min(1),
  nameUr: z.string().min(1),
  slug: z.string().optional(),
  shortDescriptionEn: z.string().optional(),
  shortDescriptionUr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionUr: z.string().optional(),
  careInstructionsEn: z.string().optional(),
  careInstructionsUr: z.string().optional(),
  categoryId: z.string(),
  images: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  variants: z.array(variantSchema).min(1),
  tags: z.array(z.string()).optional(),
  sunlight: z.enum(["low", "medium", "bright", "direct"]).optional(),
  watering: z.enum(["low", "medium", "high"]).optional(),
  difficulty: z.enum(["easy", "moderate", "advanced"]).optional(),
  suitability: z.enum(["indoor", "outdoor", "both"]).optional(),
  heightInfo: z.string().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search");

    const filter = {};
    if (search) filter.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "nameEn slug")
        .sort({ createdAt: -1 })
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
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const slug = parsed.data.slug || slugify(parsed.data.nameEn);
    const existing = await Product.findOne({ slug });
    if (existing) return jsonError("Slug already exists", 400);

    const product = await Product.create({ ...parsed.data, slug });
    return jsonSuccess({ product }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
