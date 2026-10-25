import { z } from "zod";

export const variantSchema = z.object({
  size: z.enum(["small", "medium", "large", "xlarge", "xxlarge"]),
  sizeLabelEn: z.string().min(1),
  sizeLabelUr: z.string().optional(),
  sku: z.string().optional().default(""),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  image: z.string().optional(),
  _id: z.string().optional(),
});

export const productWriteSchema = z.object({
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

/** Admin PUT — same fields, all optional except we require at least something meaningful via partial. */
export const productUpdateSchema = productWriteSchema.partial().extend({
  categoryId: z.string().optional(),
  variants: z.array(variantSchema).min(1).optional(),
});
