/** Convert Mongoose lean docs to plain JSON-safe objects for Client Components. */
export function serializeProduct(product) {
  if (!product) return null;

  return {
    _id: product._id?.toString(),
    nameEn: product.nameEn,
    nameUr: product.nameUr,
    slug: product.slug,
    shortDescriptionEn: product.shortDescriptionEn,
    shortDescriptionUr: product.shortDescriptionUr,
    descriptionEn: product.descriptionEn,
    descriptionUr: product.descriptionUr,
    careInstructionsEn: product.careInstructionsEn,
    careInstructionsUr: product.careInstructionsUr,
    featuredImage: product.featuredImage || product.images?.[0] || "/placeholder.jpg",
    images: product.images || [],
    tags: product.tags || [],
    featured: product.featured,
    isActive: product.isActive,
    sunlight: product.sunlight,
    watering: product.watering,
    difficulty: product.difficulty,
    suitability: product.suitability,
    heightInfo: product.heightInfo,
    categoryId: product.categoryId
      ? {
          _id: product.categoryId._id?.toString?.() ?? product.categoryId._id,
          slug: product.categoryId.slug,
          nameEn: product.categoryId.nameEn,
          nameUr: product.categoryId.nameUr,
        }
      : null,
    variants: (product.variants || []).map((v) => ({
      _id: v._id?.toString(),
      size: v.size,
      sizeLabelEn: v.sizeLabelEn,
      sizeLabelUr: v.sizeLabelUr,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      image: v.image,
      weight: v.weight,
      dimensions: v.dimensions,
      isActive: v.isActive,
    })),
  };
}

export function serializeProducts(products) {
  return (products || []).map(serializeProduct);
}

export function serializeCategory(category) {
  if (!category) return null;

  return {
    _id: category._id?.toString(),
    nameEn: category.nameEn,
    nameUr: category.nameUr,
    slug: category.slug,
    image: category.image || "/placeholder.jpg",
    descriptionEn: category.descriptionEn,
    descriptionUr: category.descriptionUr,
  };
}
