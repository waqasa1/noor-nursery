"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { formatPKR } from "@/lib/utils/currency";
import { useCartStore } from "@/store/cart";
import { SizeSelect, defaultSizeId } from "@/components/catalog/SizeSelect";

export function CatalogProductCard({ product, onAddToCart }) {
  const router = useRouter();
  const storeAddItem = useCartStore((s) => s.addItem);

  const variants = (product.variants || []).filter((v) => v.isActive !== false);
  const inStock = variants.filter((v) => v.stock > 0);
  const options = inStock.length ? inStock : variants;

  const [selectedId, setSelectedId] = useState(() => defaultSizeId(options));
  const selected = options.find((v) => v._id === selectedId) || options[0];

  const eyebrow = product.tags?.[0] || product.categoryId?.nameEn || "";
  const inStockCount = inStock.length;

  const handleCardClick = (e) => {
    // whole card opens the detail page — except anything interactive
    if (e.target.closest("a, button, select, input, label, textarea")) return;
    router.push(`/products/${product.slug}`);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selected || selected.stock <= 0) return;

    const item = {
      productId: product._id,
      variantId: selected._id,
      nameEn: product.nameEn,
      nameUr: product.nameUr,
      sizeLabelEn: selected.sizeLabelEn,
      sizeLabelUr: selected.sizeLabelUr,
      unitPrice: selected.price,
      image: selected.image || product.featuredImage || product.images?.[0] || "/placeholder-plant.jpg",
      maxStock: selected.stock,
      quantity: 1,
    };

    if (onAddToCart) onAddToCart(item);
    else storeAddItem(item);
  };

  const soldOut = !selected || selected.stock <= 0;
  const hasCompare = selected?.compareAtPrice > selected?.price;

  return (
    <article
      onClick={handleCardClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-[0_14px_34px_-16px_rgba(0,0,0,0.25)]"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-surface-low"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.featuredImage || product.images?.[0] || "/placeholder-plant.jpg"}
          alt={`${product.nameEn} — ${product.nameUr}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition group-hover:opacity-100" />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-secondary-foreground shadow-sm">
            Featured
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {eyebrow && (
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-secondary">
            {eyebrow}
          </p>
        )}

        <div className="mt-1 flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="min-w-0">
            <h3 className="font-display text-base font-bold leading-snug text-foreground transition group-hover:text-secondary">
              {product.nameEn}
            </h3>
          </Link>
          <span
            className="text-urdu shrink-0 text-sm leading-snug text-secondary"
            dir="rtl"
            lang="ur"
          >
            {product.nameUr}
          </span>
        </div>

        {product.shortDescriptionEn && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.shortDescriptionEn}
          </p>
        )}

        <div className="mt-auto pt-4">
          <SizeSelect
            variants={options}
            selectedId={selected?._id}
            onChange={setSelectedId}
            selectId={`size-${product._id}`}
            compact
          />

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-primary">
              {formatPKR(selected?.price ?? 0)}
            </span>
            {hasCompare && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPKR(selected.compareAtPrice)}
              </span>
            )}
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                soldOut
                  ? "bg-destructive/10 text-destructive"
                  : "bg-leaf/25 text-leaf-foreground"
              }`}
            >
              {soldOut ? "Sold out" : inStockCount > 1 ? `${inStockCount} sizes` : "In stock"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {soldOut ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
