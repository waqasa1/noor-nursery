import { StoreLayout } from "@/components/layout/StoreLayout";
import { ShopContent } from "./ShopContent";
import { getProducts } from "@/lib/data/products";
import { readShopParams, shopHeading, isAccessoryView, SHOP_PAGE_SIZE } from "./params";
import { serializeProducts } from "@/lib/utils/serialize";

/** Catalog pages are cached briefly — filters still work via searchParams. */
export const revalidate = 60;

/**
 * Server-rendered catalog: the query string is read here, products are
 * fetched from the DB, and the full grid ships in the HTML — crawlers get
 * a real <h1> plus every product instead of the client-side skeleton.
 */
export async function generateMetadata({ searchParams }) {
  const params = readShopParams(await searchParams);
  const heading = shopHeading(params);
  const noun = isAccessoryView(params) ? "accessories" : "plants";

  return {
    title: heading === "All Products" ? "Shop Plants — Noor Nursery" : `${heading} — Noor Nursery`,
    description: `Browse ${heading.toLowerCase()} — ${noun} in Small, Medium and Large sizes with nationwide delivery across Pakistan.`,
    robots: { index: true, follow: true },
  };
}

export default async function ShopPage({ searchParams }) {
  const params = readShopParams(await searchParams);

  const { products, total, pages } = await getProducts({
    page: params.page,
    limit: SHOP_PAGE_SIZE,
    category: params.category || undefined,
    type: params.type || undefined,
    search: params.search || undefined,
    featured: params.featured === "true" ? true : undefined,
    sort: params.sort,
  });

  const plainProducts = serializeProducts(products);

  return (
    <StoreLayout>
      <ShopContent
        params={params}
        products={plainProducts}
        pagination={{ page: params.page, pages: pages ?? 1, total: total ?? 0 }}
      />
    </StoreLayout>
  );
}
