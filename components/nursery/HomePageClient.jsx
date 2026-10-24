"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Categories, Hero } from "@/components/nursery/Hero";
import { Products } from "@/components/nursery/Products";
import {
  BrandStory,
  Faq,
  FeaturedPlant,
  FinalCTA,
  PlantCareFinder,
  Testimonials,
  Trust,
} from "@/components/nursery/Sections";
import { useCartStore } from "@/store/cart";

export function HomePageClient({ products = [], categories = [] }) {
  const [toast, setToast] = useState(false);
  const timer = useRef(null);
  const addItem = useCartStore((s) => s.addItem);

  const addToCart = useCallback(
    (product, variantIndex = 0) => {
      const variant = product.variants?.[variantIndex];
      if (!variant) return;

      addItem({
        productId: product._id,
        variantId: variant._id,
        nameEn: product.nameEn,
        nameUr: product.nameUr,
        sizeLabelEn: variant.sizeLabelEn,
        sizeLabelUr: variant.sizeLabelUr,
        unitPrice: variant.price,
        image: variant.image || product.featuredImage || product.images?.[0] || "/placeholder-plant.jpg",
        maxStock: variant.stock,
        quantity: 1,
      });
      setToast(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(false), 2600);
    },
    [addItem]
  );

  return (
    <>
      <Hero />
      <Categories categories={categories} />
      <Products products={products} onAdd={addToCart} />
      <FeaturedPlant />
      <Trust />
      <PlantCareFinder />
      <Testimonials />
      <BrandStory />
      <Faq />
      <FinalCTA />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-2xl"
        >
          <CheckCircle2 className="h-6 w-6 text-leaf" />
          <div>
            <p className="font-display text-sm font-bold">Added to Cart!</p>
            <p className="text-xs text-primary-foreground/75">
              Item safely added to your nursery order.{" "}
              <Link href="/cart" className="underline">
                View cart
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
