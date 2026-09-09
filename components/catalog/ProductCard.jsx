"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatPKR } from "@/lib/utils/currency";

export function CatalogProductCard({ product, onAddToCart }) {
  const activeVariants = product.variants?.filter((v) => v.isActive) || [];
  const inStockVariants = activeVariants.filter((v) => v.stock > 0);
  const startingPrice = inStockVariants.length
    ? Math.min(...inStockVariants.map((v) => v.price))
    : activeVariants.length
      ? Math.min(...activeVariants.map((v) => v.price))
      : null;

  const hasMultipleSizes = inStockVariants.length > 1;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-surface-low">
        <img
          src={product.featuredImage || product.images?.[0] || "/placeholder-plant.jpg"}
          alt={`${product.nameEn} — ${product.nameUr}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase text-secondary-foreground">
            Featured
          </span>
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

        {product.shortDescriptionEn && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {product.shortDescriptionEn}
          </p>
        )}

        <div className="mt-auto pt-4">
          {startingPrice != null ? (
            <span className="font-display text-xl font-bold text-primary">
              From {formatPKR(startingPrice)}
            </span>
          ) : (
            <span className="text-sm font-semibold text-destructive">Out of stock</span>
          )}

          <div className="mt-3">
            {hasMultipleSizes || !inStockVariants.length ? (
              <Link
                href={`/products/${product.slug}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-primary px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-surface-low"
              >
                Select Size / سائز
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onAddToCart?.({
                    productId: product._id,
                    variantId: inStockVariants[0]._id,
                    nameEn: product.nameEn,
                    nameUr: product.nameUr,
                    sizeLabelEn: inStockVariants[0].sizeLabelEn,
                    unitPrice: inStockVariants[0].price,
                    image: inStockVariants[0].image || product.featuredImage,
                    maxStock: inStockVariants[0].stock,
                    quantity: 1,
                  })
                }
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
