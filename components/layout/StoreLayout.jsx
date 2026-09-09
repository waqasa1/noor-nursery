"use client";

import { TopBar, Header, FlashDeal } from "@/components/nursery/Header";
import { Footer } from "@/components/nursery/Footer";
import { HelpPanel } from "@/components/help/HelpPanel";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

export function StoreLayout({ children, showFlashDeal = true }) {
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <Header cartCount={itemCount} cartTotal={formatPKR(subtotal)} />
      {showFlashDeal && <FlashDeal />}
      <main className="flex-1">{children}</main>
      <Footer />
      <HelpPanel />
    </div>
  );
}
