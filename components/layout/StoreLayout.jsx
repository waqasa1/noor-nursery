"use client";

import { useEffect, useState } from "react";
import { TopBar, Header, FlashDeal } from "@/components/nursery/Header";
import { Footer } from "@/components/nursery/Footer";
import { HelpPanel } from "@/components/help/HelpPanel";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export function StoreLayout({ children, showFlashDeal = true }) {
  const [isMounted, setIsMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayCount = isMounted ? itemCount : 0;
  const displayTotal = isMounted ? formatPKR(subtotal) : formatPKR(0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <Header cartCount={displayCount} cartTotal={displayTotal} />
      {showFlashDeal && <FlashDeal />}
      <main className="flex-1">{children}</main>
      <Footer />
      <HelpPanel />
    </div>
  );
}
