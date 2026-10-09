/**
 * Query-string contract for the shop, shared by:
 *  - the server page (reads `searchParams`, fetches products, builds metadata)
 *  - the client toolbar (builds URLs, renders the same heading)
 * Keeping both on one module guarantees the <h1>, <title> and the fetched
 * results always agree.
 */

export function readShopParams(sp = {}) {
  return {
    category: sp.category || "",
    type: sp.type || "",
    search: sp.search || "",
    featured: sp.featured || "",
    sort: sp.sort || "newest",
    page: Math.max(1, parseInt(sp.page || "1", 10) || 1),
  };
}

export const SHOP_PAGE_SIZE = 12;

/** The one heading used by the hero <h1> and the document title. */
export function shopHeading({ search, type, category } = {}) {
  if (search) return `Search: ${search}`;
  if (type === "accessories") return "All Accessories";
  if (type === "plants") return "All Plants";
  if (category) return category.replace(/-/g, " ");
  return "All Products";
}

export function isAccessoryView({ type } = {}) {
  return type === "accessories";
}
