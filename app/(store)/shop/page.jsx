import { ShopContent } from "./ShopContent";
import { getProducts } from "@/lib/data/products";
import { readShopParams, shopHeading, isAccessoryView, SHOP_PAGE_SIZE } from "./params";
import { serializeProducts } from "@/lib/utils/serialize";

/** Catalog pages are cached briefly — filters still work via searchParams. */
/** Cached until admin/seed calls revalidateCatalog(). */
export const revalidate = false;

/**
 * Server-rendered catalog: the query string is read here, products are
 * fetched from the DB, and the full grid ships in the HTML — crawlers get
 * a real <h1> plus every product instead of the client-side skeleton.
 */
export async function generateMetadata({ searchParams }) {
  const params = readShopParams(await searchParams);
  const heading = shopHeading(params);
  const noun = isAccessoryView(params) ? "accessories" : "plants";
  const hasSearch = Boolean(params.search?.trim());

  // Prefer a stable canonical for filtered catalog views; never index search result URLs.
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.type) qs.set("type", params.type);
  if (params.featured === "true") qs.set("featured", "true");
  const query = qs.toString();
  const path = query ? `/shop?${query}` : "/shop";

  const title =
    heading === "All Products" ? "Shop Plants Online in Pakistan" : heading;
  const description = `Browse ${heading.toLowerCase()} — ${noun} in Small, Medium and Large sizes with nationwide delivery across Pakistan. COD and JazzCash.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    robots: hasSearch
      ? { index: false, follow: true }
      : { index: true, follow: true },
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
    minPrice: params.minPrice || undefined,
    maxPrice: params.maxPrice || undefined,
    available: params.available === "true" ? true : undefined,
  });

  const plainProducts = serializeProducts(products);

  return (
    <ShopContent
        params={params}
        products={plainProducts}
        pagination={{ page: params.page, pages: pages ?? 1, total: total ?? 0 }}
      />
  );
}
