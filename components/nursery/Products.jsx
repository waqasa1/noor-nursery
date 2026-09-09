"use client";

import { useState } from "react";
import { Flower2, MessageCircle, ShoppingCart, Star, Sun } from "lucide-react";
import { FILTER_TABS, PRODUCTS } from "./data";

function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState(0);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-surface-low">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.tags.map((t, i) => (
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
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight text-foreground">
            {product.name}
          </h3>
          <span className="text-urdu shrink-0 text-sm text-secondary" dir="rtl" lang="ur">
            {product.urdu}
          </span>
        </div>
        <p className="mt-0.5 text-xs italic text-muted-foreground">{product.botanical}</p>

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="font-bold text-foreground">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>

        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-surface-low px-2.5 py-2 text-[11px] font-medium text-muted-foreground">
          <Sun className="mt-px h-3.5 w-3.5 shrink-0 text-gold-foreground" />
          {product.care}
        </p>

        <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Select Plant Height / <span lang="ur">سائز</span>:
        </p>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {product.sizes.map((s, i) => (
            <button
              key={s}
              onClick={() => setSize(i)}
              className={`rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition ${
                size === i
                  ? "border-secondary bg-secondary text-secondary-foreground"
                  : "border-border bg-card text-foreground hover:border-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end gap-2">
            <span className="font-display text-xl font-bold text-primary">{product.price}</span>
            <span className="text-sm text-muted-foreground line-through">{product.oldPrice}</span>
          </div>
          <p className="mt-0.5 text-[11px] font-bold text-secondary">{product.badge}</p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onAdd?.(product, size)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button
              className="grid place-items-center rounded-xl border-2 border-secondary px-3 text-secondary transition hover:bg-surface-low"
              aria-label={`WhatsApp about ${product.name}`}
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Products({ onAdd }) {
  const [tab, setTab] = useState("all");
  const list = tab === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === tab);

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
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Select size variants directly on each card:{" "}
            <strong className="text-foreground">Small (4&quot;-6&quot;)</strong>,{" "}
            <strong className="text-foreground">Medium (8&quot;-10&quot;)</strong>, or{" "}
            <strong className="text-foreground">Specimen Large (12&quot;-14&quot;)</strong>.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {FILTER_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
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
            href="#faq"
            className="rounded-full bg-leaf px-6 py-3 text-sm font-bold text-leaf-foreground transition hover:bg-gold hover:text-gold-foreground"
          >
            Request Bulk Nursery Quote (WhatsApp)
          </a>
        </div>
      </div>
    </section>
  );
}
