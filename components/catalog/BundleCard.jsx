"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CatalogImage } from "@/components/catalog/CatalogImage";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export function BundleCard({ bundle, onAdded }) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = !bundle?.maxStock || bundle.maxStock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      type: "bundle",
      bundleId: bundle._id,
      nameEn: bundle.nameEn,
      nameUr: bundle.nameUr || "",
      unitPrice: bundle.price,
      image: bundle.image,
      maxStock: bundle.maxStock,
      quantity: 1,
      contents: (bundle.items || []).map((c) => ({
        productId: c.productId,
        variantId: c.variantId,
        nameEn: c.nameEn,
        sizeLabelEn: c.sizeLabelEn,
        quantity: c.quantity,
        image: c.image,
      })),
    });
    onAdded?.();
  };

  const preview = (bundle.items || []).slice(0, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <Link href={`/bundles/${bundle.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-low">
        <CatalogImage
          src={bundle.image}
          alt={bundle.nameEn}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/bundles/${bundle.slug}`} className="block">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary">
            {bundle.nameEn}
          </h3>
          {bundle.nameUr ? (
            <p className="text-urdu mt-0.5 text-sm text-secondary" dir="rtl" lang="ur">
              {bundle.nameUr}
            </p>
          ) : null}
        </Link>
        {preview.length > 0 && (
          <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
            {preview.map((c) => (
              <li key={`${c.productId}-${c.variantId}`}>
                {c.quantity > 1 ? `${c.quantity}× ` : ""}
                {c.nameEn}
                {c.sizeLabelEn ? ` · ${c.sizeLabelEn}` : ""}
              </li>
            ))}
            {(bundle.items || []).length > preview.length && (
              <li>+{(bundle.items || []).length - preview.length} more</li>
            )}
          </ul>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="font-display text-xl font-bold text-primary">{formatPKR(bundle.price)}</p>
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {outOfStock ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
