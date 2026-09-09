"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { FlashDeal, Header, TopBar } from "@/components/nursery/Header";
import { Categories, Hero } from "@/components/nursery/Hero";
import { Products } from "@/components/nursery/Products";
import { Faq, Testimonials, Trust } from "@/components/nursery/Sections";
import { Footer } from "@/components/nursery/Footer";
import { HelpPanel } from "@/components/help/HelpPanel";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export default function Page() {
  const [toast, setToast] = useState(false);
  const timer = useRef(null);
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());
  const addItem = useCartStore((s) => s.addItem);

  const addToCart = useCallback(
    (product, sizeIndex = 0) => {
      const price = parseInt(String(product.price).replace(/[^\d]/g, ""), 10) || 0;
      addItem({
        productId: product.id,
        variantId: `${product.id}-${sizeIndex}`,
        nameEn: product.name,
        nameUr: product.urdu,
        sizeLabelEn: product.sizes?.[sizeIndex] || "Standard",
        unitPrice: price,
        image: product.image,
        maxStock: 99,
        quantity: 1,
      });
      setToast(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(false), 2600);
    },
    [addItem]
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header cartCount={itemCount} cartTotal={formatPKR(subtotal)} />
      <FlashDeal />
      <main>
        <Hero />
        <Categories />
        <Products onAdd={addToCart} />
        <Trust />
        <Testimonials />
        <Faq />
        <section className="bg-primary py-12 text-center text-primary-foreground">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="font-display text-2xl font-bold">Browse Our Full Catalog</h2>
            <p className="text-urdu mt-2 text-primary-foreground/80" dir="rtl" lang="ur">
              مکمل کیٹalog دیکھیں
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-leaf px-8 py-3 text-sm font-bold text-leaf-foreground transition hover:bg-gold hover:text-gold-foreground"
            >
              Shop All Plants
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <HelpPanel />

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
              <Link href="/cart" className="underline">View cart</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
