"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { CatalogImage } from "@/components/catalog/CatalogImage";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export function BundleDetail({ bundle }) {
  const addItem = useCartStore((s) => s.addItem);
  const [toast, setToast] = useState(false);
  const outOfStock = !bundle?.maxStock || bundle.maxStock <= 0;

  const handleAdd = () => {
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
    setToast(true);
    setTimeout(() => setToast(false), 2600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-secondary">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/bundles" className="hover:text-secondary">
          Bundles
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{bundle.nameEn}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface-low">
          <CatalogImage
            src={bundle.image}
            alt={bundle.nameEn}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Bundle</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {bundle.nameEn}
          </h1>
          {bundle.nameUr ? (
            <p className="text-urdu mt-1 text-xl text-secondary" dir="rtl" lang="ur">
              {bundle.nameUr}
            </p>
          ) : null}

          <p className="mt-6 font-display text-3xl font-bold text-primary">
            {formatPKR(bundle.price)}
          </p>

          {bundle.descriptionEn ? (
            <p className="mt-4 text-muted-foreground leading-relaxed">{bundle.descriptionEn}</p>
          ) : null}

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-foreground">What&apos;s included</h2>
            <ul className="mt-4 space-y-3">
              {(bundle.items || []).map((c) => (
                <li
                  key={`${c.productId}-${c.variantId}`}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3"
                >
                  {c.image ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-low">
                      <CatalogImage src={c.image} alt={c.nameEn} className="object-cover" sizes="56px" />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${c.productSlug}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {c.quantity > 1 ? `${c.quantity}× ` : ""}
                      {c.nameEn}
                    </Link>
                    {c.sizeLabelEn ? (
                      <p className="text-xs text-muted-foreground">{c.sizeLabelEn}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? "Sold out" : "Add bundle to cart"}
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-2xl"
        >
          <CheckCircle2 className="h-6 w-6 text-leaf" />
          <div>
            <p className="font-display text-sm font-bold">Bundle added!</p>
            <Link href="/cart" className="text-xs underline">
              View cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
