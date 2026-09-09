"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { FlashDeal, Header, TopBar } from "@/components/nursery/Header";
import { Categories, Hero } from "@/components/nursery/Hero";
import { Products } from "@/components/nursery/Products";
import { Faq, Testimonials, Trust } from "@/components/nursery/Sections";
import { Footer } from "@/components/nursery/Footer";

export default function Page() {
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(false);
  const timer = useRef(null);

  const addToCart = useCallback(() => {
    setCartCount((c) => c + 1);
    setToast(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(false), 2600);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header cartCount={cartCount} />
      <FlashDeal />
      <main>
        <Hero />
        <Categories />
        <Products onAdd={addToCart} />
        <Trust />
        <Testimonials />
        <Faq />
      </main>
      <Footer />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-2xl"
        >
          <CheckCircle2 className="h-6 w-6 text-leaf" />
          <div>
            <p className="font-display text-sm font-bold">Added to Cart!</p>
            <p className="text-xs text-primary-foreground/75">
              Item safely added to your nursery order.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
