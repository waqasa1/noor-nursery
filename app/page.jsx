import { getFeaturedProducts, getCategories } from "@/lib/data/products";
import { HomePageClient } from "@/components/nursery/HomePageClient";

export const dynamic = "force-dynamic";

function serializeProduct(product) {
  return {
    _id: product._id.toString(),
    nameEn: product.nameEn,
    nameUr: product.nameUr,
    slug: product.slug,
    featuredImage: product.featuredImage || product.images?.[0] || "/placeholder.jpg",
    images: product.images || [],
    tags: product.tags || [],
    careInstructionsEn: product.careInstructionsEn,
    categoryId: product.categoryId
      ? {
          _id: product.categoryId._id?.toString(),
          slug: product.categoryId.slug,
          nameEn: product.categoryId.nameEn,
        }
      : null,
    variants: (product.variants || [])
      .filter((v) => v.isActive)
      .map((v) => ({
        _id: v._id.toString(),
        size: v.size,
        sizeLabelEn: v.sizeLabelEn,
        sizeLabelUr: v.sizeLabelUr,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        image: v.image,
        isActive: v.isActive,
      })),
  };
}

function serializeCategory(category) {
  return {
    _id: category._id.toString(),
    nameEn: category.nameEn,
    nameUr: category.nameUr,
    slug: category.slug,
    image: category.image || "/placeholder.jpg",
  };
}

export default async function Page() {
  let products = [];
  let categories = [];

  try {
    [products, categories] = await Promise.all([
      getFeaturedProducts(3),
      getCategories(),
    ]);
  } catch (error) {
    console.error("[homepage] Failed to load catalog:", error.message);
  }

  return (
    <HomePageClient
      products={products.map(serializeProduct)}
      categories={categories.slice(0, 7).map(serializeCategory)}
    />
  );
}
