"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/ProductCard";
import { useCartStore } from "@/store/cart";

export function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [toast, setToast] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const featured = searchParams.get("featured") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = searchParams.get("page") || "1";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: "12", sort });
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (featured) params.set("featured", featured);

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setPagination(data.pagination || { page: 1, pages: 1 });
    setLoading(false);
  }, [category, search, featured, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAdd = (item) => {
    addItem(item);
    setToast(true);
    setTimeout(() => setToast(false), 2600);
  };

  return (
    <section className="bg-surface-low py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Plant Catalog</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Shop Plants &amp; Nursery Products
          </h1>
          <p className="text-urdu mt-2 text-secondary" dir="rtl" lang="ur">
            پودے اور نرسری مصنوعات خریدیں
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            { id: "newest", label: "Newest" },
            { id: "featured", label: "Featured" },
            { id: "price_asc", label: "Price: Low to High" },
            { id: "price_desc", label: "Price: High to Low" },
          ].map((s) => (
            <a
              key={s.id}
              href={`/shop?${new URLSearchParams({ ...(category && { category }), ...(search && { search }), sort: s.id }).toString()}`}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                sort === s.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-secondary"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-mid" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-card p-12 text-center">
            <p className="text-lg font-semibold text-foreground">No plants found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search or browse all categories.
            </p>
            <a href="/categories" className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
              View Categories
            </a>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <CatalogProductCard key={p._id} product={p} onAddToCart={handleAdd} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/shop?${new URLSearchParams({ ...(category && { category }), ...(search && { search }), sort, page: String(p) }).toString()}`}
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold ${
                      pagination.page === p ? "bg-primary text-primary-foreground" : "border bg-card"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-2xl">
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
