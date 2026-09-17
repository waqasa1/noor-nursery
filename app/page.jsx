import { getFeaturedProducts, getCategories } from "@/lib/data/products";
import { HomePageClient } from "@/components/nursery/HomePageClient";
import { serializeCategory, serializeProduct } from "@/lib/utils/serialize";

export const dynamic = "force-dynamic";

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
