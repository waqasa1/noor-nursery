import { z } from "zod";

const mongoId = z.string().min(1);

export const bundleItemSchema = z.object({
  productId: mongoId,
  variantId: mongoId,
  quantity: z.number().int().min(1).max(50),
});

export const bundleWriteSchema = z.object({
  nameEn: z.string().min(2).max(120),
  nameUr: z.string().max(120).optional().default(""),
  slug: z.string().max(140).optional(),
  descriptionEn: z.string().max(800).optional().default(""),
  descriptionUr: z.string().max(800).optional().default(""),
  image: z.string().max(500).optional().default(""),
  price: z.number().min(0),
  items: z.array(bundleItemSchema).min(2, "Add at least two products"),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const bundleUpdateSchema = bundleWriteSchema.partial().extend({
  items: z.array(bundleItemSchema).min(2).optional(),
});
