"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Droplets,
  MessageCircle,
  Package,
  ShoppingCart,
  Sun,
} from "lucide-react";
import { ProductInfoSections } from "@/components/products/ProductInfoSections";
import { CatalogProductCard } from "@/components/catalog/ProductCard";
import { BRAND } from "@/lib/brand";
import { extractBotanicalName } from "@/lib/products/product-detail-content";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export function ProductDetail({ product, related }) {
  const activeVariants = product.variants?.filter((v) => v.isActive) || [];
  const images = [
    product.featuredImage,
    ...(product.images || []).filter((img) => img && img !== product.featuredImage),
  ].filter(Boolean);

  const [selectedIdx, setSelectedIdx] = useState(
    activeVariants.findIndex((v) => v.stock > 0) >= 0
      ? activeVariants.findIndex((v) => v.stock > 0)
      : 0
  );
  const [activeImage, setActiveImage] = useState(0);
  const [toast, setToast] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variant = activeVariants[selectedIdx];
  const outOfStock = !variant || variant.stock <= 0;
  const botanical = extractBotanicalName(product);

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({
      productId: product._id,
      variantId: variant._id,
      nameEn: product.nameEn,
      nameUr: product.nameUr,
      sizeLabelEn: variant.sizeLabelEn,
      sizeLabelUr: variant.sizeLabelUr,
      unitPrice: variant.price,
      image: variant.image || product.featuredImage,
      maxStock: variant.stock,
      quantity: 1,
    });
    setToast(true);
    setTimeout(() => setToast(false), 2600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-secondary">
          Home
        </Link>
        {" / "}
        <Link href="/shop" className="hover:text-secondary">
          Shop
        </Link>
        {product.categoryId && (
          <>
            {" / "}
            <Link href={`/categories/${product.categoryId.slug}`} className="hover:text-secondary">
              {product.categoryId.nameEn}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.nameEn}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-surface-low shadow-md">
            <img
              src={images[activeImage] || "/placeholder.jpg"}
              alt={`${product.nameEn} — ${product.nameUr}`}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    activeImage === i ? "border-secondary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {product.nameEn}
          </h1>

          {botanical && (
            <p className="mt-1 text-sm italic text-muted-foreground">{botanical}</p>
          )}

          <p className="text-urdu mt-2 text-xl text-secondary" dir="rtl" lang="ur">
            {product.nameUr}
          </p>

          {product.categoryId && (
            <Link
              href={`/categories/${product.categoryId.slug}`}
              className="mt-2 inline-block text-sm font-medium text-secondary hover:text-primary"
            >
              {product.categoryId.nameEn}
            </Link>
          )}

          {product.shortDescriptionEn && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {product.shortDescriptionEn}
            </p>
          )}
          {product.shortDescriptionUr && (
            <p className="text-urdu mt-2 text-muted-foreground" dir="rtl" lang="ur">
              {product.shortDescriptionUr}
            </p>
          )}

          {variant && (
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <p className="font-display text-3xl font-bold text-primary">
                {formatPKR(variant.price)}
              </p>
              {variant.compareAtPrice > variant.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPKR(variant.compareAtPrice)}
                </span>
              )}
              {!outOfStock && (
                <span className="rounded-full bg-leaf/20 px-3 py-1 text-xs font-bold text-leaf-foreground">
                  In Stock
                </span>
              )}
            </div>
          )}

          <p className="mt-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Select Size / <span lang="ur">سائز منتخب کریں</span>
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {activeVariants.map((v, i) => (
              <button
                key={v._id}
                type="button"
                disabled={v.stock <= 0}
                onClick={() => setSelectedIdx(i)}
                aria-pressed={selectedIdx === i}
                className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                  v.stock <= 0
                    ? "cursor-not-allowed opacity-50"
                    : selectedIdx === i
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border hover:border-secondary"
                }`}
              >
                <span className="block">{v.sizeLabelEn}</span>
                {v.sizeLabelUr && (
                  <span className="text-urdu block text-xs" dir="rtl" lang="ur">
                    {v.sizeLabelUr}
                  </span>
                )}
                {v.stock <= 0 && (
                  <span className="block text-xs text-destructive">Out of stock</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={outOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition hover:bg-forest disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              {outOfStock ? "Out of Stock" : "Add to Cart"}
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
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-secondary px-5 py-4 text-secondary transition hover:bg-surface-low"
              aria-label={`Ask on WhatsApp about ${product.nameEn}`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden text-sm font-bold sm:inline">WhatsApp</span>
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {product.sunlight && (
              <div className="flex items-center gap-2 rounded-xl bg-surface-low px-3 py-2.5 text-sm">
                <Sun className="h-4 w-4 text-gold" />
                <span className="capitalize">{product.sunlight} light</span>
              </div>
            )}
            {product.watering && (
              <div className="flex items-center gap-2 rounded-xl bg-surface-low px-3 py-2.5 text-sm">
                <Droplets className="h-4 w-4 text-secondary" />
                <span className="capitalize">{product.watering} watering</span>
              </div>
            )}
            {product.difficulty && (
              <div className="rounded-xl bg-surface-low px-3 py-2.5 text-sm capitalize">
                {product.difficulty} care
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-surface-low/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BadgeCheck className="h-4 w-4 text-secondary" />
              {BRAND.sloganSecondary}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-secondary" />
                Secure packaging
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-secondary" />
                48-hr live guarantee
              </span>
              <span>Cash on Delivery available</span>
            </div>
          </div>
        </div>
      </div>

      <ProductInfoSections product={product} variant={variant} />

      {related?.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold text-primary">Related Plants</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            More from {product.categoryId?.nameEn || "our collection"}
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <CatalogProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-2xl"
        >
          <CheckCircle2 className="h-6 w-6 text-leaf" />
          <p className="font-display text-sm font-bold">Added to Cart!</p>
        </div>
      )}
    </div>
  );
}
