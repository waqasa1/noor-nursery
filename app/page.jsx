import { getFeaturedProducts, getCategories } from "@/lib/data/products";
import { HomePageClient } from "@/components/nursery/HomePageClient";
import { serializeCategory, serializeProduct } from "@/lib/utils/serialize";

// Homepage regenerates in the background every 60s instead of blocking each
// request on the DB (featured products / categories rarely change).
export const revalidate = 60;

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
