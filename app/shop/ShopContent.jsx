"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Leaf } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/ProductCard";
import { useCartStore } from "@/store/cart";
import { IMAGES } from "@/components/nursery/data";

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
    <section className="bg-background pb-14">
      {/* Decorative Header */}
      <div className="relative h-64 w-full bg-primary lg:h-80">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src={IMAGES.fruitTrees} alt="Plants background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-lg">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            {search ? `Search: ${search}` : category ? `Category: ${category.replace(/-/g, ' ')}` : "Shop All Plants"}
          </h1>
          <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">
            پودے اور نرسری مصنوعات
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <p className="text-sm font-medium text-muted-foreground">
            {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
          </p>
          <div className="flex flex-wrap gap-2">
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
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[400px] animate-pulse rounded-3xl bg-surface-mid" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border bg-card py-20 text-center shadow-sm">
            <p className="text-xl font-display font-bold text-foreground">No plants found</p>
            <p className="mt-2 text-muted-foreground max-w-md">
              Try a different search term or browse our categories to find what you're looking for.
            </p>
            <a href="/categories" className="mt-8 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:bg-forest">
              View Categories
            </a>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <CatalogProductCard key={p._id} product={p} onAddToCart={handleAdd} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/shop?${new URLSearchParams({ ...(category && { category }), ...(search && { search }), sort, page: String(p) }).toString()}`}
                    className={`grid h-12 w-12 place-items-center rounded-full font-bold transition-all ${
                      pagination.page === p 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "border bg-card hover:border-primary/30"
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
