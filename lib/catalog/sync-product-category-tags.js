import Category from "@/models/Category";

/**
 * Keep product.tags aligned with the assigned category name.
 * Seeded catalogs stored the old category in tags[0], which then overrode
 * the real category on product cards after an admin moved the plant.
 */
export async function syncProductCategoryTags(data) {
  if (!data?.categoryId) return data;

  const category = await Category.findById(data.categoryId).select("nameEn").lean();
  if (!category?.nameEn) return data;

  const name = category.nameEn;
  const existing = Array.isArray(data.tags) ? data.tags : [];
  const rest = existing.filter(
    (t) => t && String(t).toLowerCase() !== name.toLowerCase()
  );

  return {
    ...data,
    tags: [name, ...rest].slice(0, 5),
  };
}
