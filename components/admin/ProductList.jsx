"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Pencil, Search, Trash2 } from "lucide-react";
import { AdminPageHeaderSkeleton, AdminTableSkeleton } from "@/components/admin/AdminSkeleton";
import { formatPKR } from "@/lib/utils/currency";

export function ProductList({ type, title, addHref, addLabel }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/products?type=${type}&limit=200`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [type]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.nameEn?.toLowerCase().includes(q) ||
        p.nameUr?.includes(query.trim()) ||
        p.slug?.toLowerCase().includes(q) ||
        p.categoryId?.nameEn?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const archive = async (product) => {
    if (!window.confirm(`Archive "${product.nameEn}"? It will be hidden from the store.`)) return;
    const res = await fetch(`/api/admin/products/${product._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) {
      window.alert(data.message || "Could not archive product");
      return;
    }
    setNotice(`Archived "${product.nameEn}"`);
    load();
  };

  if (loading) {
    return (
      <>
        <AdminPageHeaderSkeleton action />
        <AdminTableSkeleton columns={7} rows={8} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} {type === "accessory" ? "accessories" : "plants"} in catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border-2 border-foreground/25 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-foreground/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, slug, category…"
              aria-label="Search products"
              className="w-48 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-foreground/50"
            />
          </div>
          <Link
            href={addHref}
            className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest"
          >
            {addLabel}
          </Link>
        </div>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border-2 border-secondary/40 bg-white px-4 py-2.5 text-sm font-semibold text-foreground">
          {notice}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-card p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-semibold">
            {products.length === 0 ? "No products yet." : "No products match that search."}
          </p>
          {products.length === 0 && (
            <Link href={addHref} className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              {addLabel}
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground/15 bg-surface-low text-left text-xs font-bold uppercase tracking-wide text-foreground">
                <th className="p-3">Product</th>
                <th>Category</th>
                <th>Sizes &amp; Prices</th>
                <th className="text-right">From</th>
                <th className="text-right">Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const variants = p.variants || [];
                const stock = variants.reduce((s, v) => s + (v.stock || 0), 0);
                const price = variants.length ? Math.min(...variants.map((v) => v.price)) : 0;
                return (
                  <tr key={p._id} className="border-b border-foreground/10 align-top last:border-0 hover:bg-surface-low/60">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.featuredImage || "/placeholder-plant.jpg"}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-lg border object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground">{p.nameEn}</p>
                          <p className="text-urdu text-xs text-secondary" dir="rtl" lang="ur">
                            {p.nameUr}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="pt-3 text-muted-foreground">{p.categoryId?.nameEn || "—"}</td>
                    <td className="pt-3">
                      <div className="flex max-w-[16rem] flex-wrap gap-1">
                        {variants.map((v) => (
                          <span
                            key={v._id}
                            className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
                              v.isActive && v.stock > 0
                                ? "border-secondary/40 bg-white text-foreground"
                                : "border-foreground/20 bg-surface-low text-muted-foreground"
                            }`}
                          >
                            {v.sizeLabelEn} · {formatPKR(v.price)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="pt-3 text-right font-bold text-foreground">{formatPKR(price)}</td>
                    <td className="pt-3 text-right">
                      <span className={stock > 0 ? "font-semibold text-foreground" : "font-bold text-destructive"}>
                        {stock}
                      </span>
                    </td>
                    <td className="pt-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                          p.isActive
                            ? "bg-secondary/15 text-secondary"
                            : "bg-foreground/10 text-muted-foreground"
                        }`}
                      >
                        {p.isActive ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="flex items-center gap-1 rounded-lg border-2 border-secondary/40 bg-white px-2.5 py-1.5 text-xs font-bold text-secondary transition hover:bg-secondary hover:text-secondary-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => archive(p)}
                          className="flex items-center gap-1 rounded-lg border-2 border-destructive/40 bg-white px-2.5 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
