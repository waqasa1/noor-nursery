"use client";

import { useState } from "react";
import Link from "next/link";
import { Flower2, MessageCircle, ShoppingCart, Sun } from "lucide-react";
import { formatPKR } from "@/lib/utils/currency";
import { buildBulkOrderWhatsAppUrl, buildProductWhatsAppUrl } from "@/lib/whatsapp";

function ProductCard({ product, onAdd }) {
  const activeVariants = product.variants?.filter((v) => v.isActive && v.stock > 0) || product.variants || [];
  const [size, setSize] = useState(0);
  const variant = activeVariants[size] || product.variants?.[0];
  const minPrice = Math.min(...(product.variants?.map((v) => v.price) || [0]));
  const comparePrice = variant?.compareAtPrice || Math.round(minPrice * 1.15);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-surface-low">
        <img
          src={product.featuredImage || "/placeholder.jpg"}
          alt={product.nameEn}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.tags?.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.tags.slice(0, 2).map((t, i) => (
              <span
                key={t}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow ${
                  i === 0
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-card text-secondary"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-display text-base font-bold leading-tight text-foreground hover:text-secondary">
              {product.nameEn}
            </h3>
          </Link>
          <span className="text-urdu shrink-0 text-sm text-secondary" dir="rtl" lang="ur">
            {product.nameUr}
          </span>
        </div>

        {product.careInstructionsEn && (
          <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-low px-2.5 py-2 text-[11px] font-medium text-muted-foreground">
            <Sun className="mt-px h-3.5 w-3.5 shrink-0 text-gold-foreground" />
            {product.careInstructionsEn}
          </p>
        )}

        {activeVariants.length > 1 && (
          <>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Select Plant Height / <span lang="ur">سائز</span>:
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {activeVariants.map((s, i) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setSize(i)}
                  className={`rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition ${
                    size === i
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border bg-card text-foreground hover:border-secondary"
                  }`}
                >
                  {s.sizeLabelEn}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-end gap-2">
            <span className="font-display text-xl font-bold text-primary">
              {formatPKR(variant?.price || minPrice)}
            </span>
            {comparePrice > (variant?.price || minPrice) && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPKR(comparePrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onAdd?.(product, product.variants.findIndex((v) => v._id === variant._id))}
              disabled={!variant || variant.stock <= 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <a
              href={buildProductWhatsAppUrl({
                nameEn: product.nameEn,
                nameUr: product.nameUr,
                slug: product.slug,
                sizeLabel: variant?.sizeLabelEn,
                price: variant?.price,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="grid place-items-center rounded-xl border-2 border-secondary px-3 text-secondary transition hover:bg-surface-low"
              aria-label={`WhatsApp about ${product.nameEn}`}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Products({ products = [], onAdd }) {
  const list = products.slice(0, 3);

  if (!products.length) {
    return (
      <section id="plants" className="bg-surface-low py-14">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-primary">Featured Plants</h2>
          <p className="mt-4 text-muted-foreground">
            Browse our full catalog while we load featured products.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
          >
            Shop All Plants
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="plants" className="bg-surface-low py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Catalog Inventory · 300+ Acclimatized Live Plants Available
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Featured Nursery Plants &amp; Size Variants
          </h2>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p._id} product={p} onAdd={onAdd} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-primary px-6 py-7 text-primary-foreground sm:px-10">
          <div className="flex items-start gap-4">
            <Flower2 className="mt-1 h-8 w-8 shrink-0 text-leaf" />
            <div>
              <p className="font-display text-lg font-bold">
                Need custom bulk nursery orders for farmhouses or offices?
              </p>
              <p className="text-sm text-primary-foreground/75">
                We deliver commercial landscaping trucks across Punjab &amp; Sindh.
              </p>
            </div>
          </div>
          <a
            href={buildBulkOrderWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground transition hover:bg-gold hover:text-gold-foreground"
          >
            Request Bulk Nursery Quote (WhatsApp)
          </a>
        </div>
      </div>
    </section>
  );
}
