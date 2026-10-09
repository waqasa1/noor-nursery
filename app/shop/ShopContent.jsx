"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Search,
  X,
} from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/ProductCard";
import { useCartStore } from "@/store/cart";
import { IMAGES } from "@/components/nursery/data";
import { shopHeading, isAccessoryView, SHOP_PAGE_SIZE } from "./params";

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "featured", label: "Featured" },
  { id: "price_asc", label: "Price: low to high" },
  { id: "price_desc", label: "Price: high to low" },
];

const PAGE_SIZE = SHOP_PAGE_SIZE;
const WINDOW = 5;

/** Sliding window of page numbers: page 5 of 18 → 3 4 5 6 7 */
export function pageWindow(current, total, size = WINDOW) {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(size / 2);
  let start = Math.max(1, current - half);
  let end = start + size - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - size + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function ShopContent({ params, products, pagination }) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(() => params.search || "");
  const [toast, setToast] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const { category, type, search, featured, sort } = params;

  const buildUrl = useCallback(
    (patch = {}) => {
      const values = {
        category,
        type,
        search,
        featured,
        sort,
        page: "1",
        ...patch,
      };
      const params = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (!value) return;
        if (key === "sort" && value === "newest") return;
        if (key === "page" && String(value) === "1") return;
        params.set(key, String(value));
      });
      const qs = params.toString();
      return `${pathname}${qs ? `?${qs}` : ""}`;
    },
    [pathname, category, type, search, featured, sort]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleAdd = (item) => {
    addItem(item);
    setToast(true);
    setTimeout(() => setToast(false), 2600);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    router.push(buildUrl({ search: searchInput.trim(), page: "1" }));
  };

  const isAccessory = isAccessoryView(params);
  const noun = isAccessory ? "accessories" : "products";

  const heading = shopHeading(params);

  const activeFilters = [
    search && { key: "search", label: `“${search}”`, clear: { search: "" } },
    category && { key: "category", label: category.replace(/-/g, " "), clear: { category: "" } },
    type && { key: "type", label: type === "accessories" ? "accessories" : "plants", clear: { type: "" } },
  ].filter(Boolean);

  const showingFrom = (pagination.page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(pagination.page * PAGE_SIZE, pagination.total);

  return (
    <section className="bg-background pb-16">
      {/* Hero */}
      <div className="relative h-52 w-full overflow-hidden bg-primary lg:h-64">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src={IMAGES.fruitTrees} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-leaf">
            <Leaf className="h-4 w-4" /> Noor Nursery
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="text-urdu mt-2 text-left text-lg text-primary-foreground/85" dir="rtl" lang="ur">
            {isAccessory ? "گارڈننگ اوزار اور سامان" : "پودے اور نرسری مصنوعات"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Toolbar: search + filters + sort */}
        <div className="-mt-8 relative z-20 rounded-2xl border border-foreground/10 bg-card p-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] sm:p-5">
          <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Search ${noun}, sizes, categories…`}
                aria-label="Search products"
                className="w-full rounded-full border-2 border-foreground/15 bg-white py-3 pl-11 pr-10 text-sm font-semibold text-foreground outline-none transition placeholder:font-medium placeholder:text-muted-foreground focus:border-secondary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => router.push(buildUrl({ search: "", page: "1" }))}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-surface-low hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-forest"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-display text-base font-bold text-foreground">
                  {pagination.total}
                </span>{" "}
                {noun} found
                {pagination.total > 0 && (
                  <span className="hidden sm:inline">
                    {" "}
                    · showing {showingFrom}–{showingTo}
                  </span>
                )}
              </p>
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => router.push(buildUrl({ ...f.clear, page: "1" }))}
                  className="flex items-center gap-1.5 rounded-full border-2 border-secondary/40 bg-white px-2.5 py-1 text-xs font-bold text-secondary transition hover:bg-secondary hover:text-secondary-foreground"
                >
                  {f.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                Sort by
              </span>
              <select
                value={sort}
                onChange={(e) => router.push(buildUrl({ sort: e.target.value, page: "1" }))}
                className="cursor-pointer rounded-full border-2 border-foreground/15 bg-white px-4 py-2 text-sm font-bold text-foreground outline-none transition hover:border-secondary focus:border-secondary"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Results */}
        {products.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border bg-card py-20 text-center shadow-sm">
            <p className="font-display text-xl font-bold text-foreground">
              {isAccessory ? "No accessories found" : "No products found"}
            </p>
            <p className="mt-2 max-w-md text-muted-foreground">
              Try a different search term, or browse the categories to find what you need.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {search && (
                <button
                  type="button"
                  onClick={() => router.push(buildUrl({ search: "", page: "1" }))}
                  className="rounded-full border-2 border-foreground/20 px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-surface-low"
                >
                  Clear search
                </button>
              )}
              <Link
                href="/categories"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest"
              >
                View Categories
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <CatalogProductCard key={p._id} product={p} onAddToCart={handleAdd} />
              ))}
            </div>

            <Pagination
              current={pagination.page}
              total={pagination.pages}
              href={(p) => buildUrl({ page: String(p) })}
            />
          </>
        )}
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-2xl"
        >
          <CheckCircle2 className="h-6 w-6 text-leaf" />
          <div>
            <p className="font-display text-sm font-bold">Added to Cart!</p>
            <p className="text-xs text-primary-foreground/75">Item safely added to your order.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function Pagination({ current, total, href }) {
  if (!total || total <= 1) return null;
  const pages = pageWindow(current, total);

  const arrow = (target, disabled, Icon, label) =>
    disabled ? (
      <span
        aria-hidden="true"
        className="grid h-11 w-11 place-items-center rounded-full border-2 border-foreground/10 bg-white text-foreground/30"
      >
        <Icon className="h-4 w-4" />
      </span>
    ) : (
      <a
        href={href(target)}
        aria-label={label}
        className="grid h-11 w-11 place-items-center rounded-full border-2 border-foreground/15 bg-white text-foreground transition hover:border-secondary hover:text-secondary"
      >
        <Icon className="h-4 w-4" />
      </a>
    );

  return (
    <nav className="mt-12 flex flex-col items-center gap-3" aria-label="Pagination">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {arrow(current - 1, current <= 1, ChevronLeft, "Previous page")}

        {pages[0] > 1 && (
          <span className="grid h-11 min-w-11 place-items-center px-1 text-sm font-bold text-muted-foreground">
            …
          </span>
        )}

        {pages.map((p) => (
          <a
            key={p}
            href={href(p)}
            aria-current={p === current ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`grid h-11 min-w-11 place-items-center rounded-full px-3 text-sm font-bold transition ${
              p === current
                ? "bg-primary text-primary-foreground shadow-md"
                : "border-2 border-foreground/15 bg-white text-foreground hover:border-secondary hover:text-secondary"
            }`}
          >
            {p}
          </a>
        ))}

        {total > pages[pages.length - 1] && (
          <span className="grid h-11 min-w-11 place-items-center px-1 text-sm font-bold text-muted-foreground">
            …
          </span>
        )}

        {arrow(current + 1, current >= total, ChevronRight, "Next page")}
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        Page {current} of {total}
      </p>
    </nav>
  );
}
