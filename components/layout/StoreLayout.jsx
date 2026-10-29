"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar, Header, FlashDeal } from "@/components/nursery/Header";
import { Footer } from "@/components/nursery/Footer";
import { HelpPanel } from "@/components/help/HelpPanel";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/currency";

function defaultShowFlashDeal(pathname) {
  if (!pathname) return false;
  return (
    pathname === "/" ||
    pathname === "/shop" ||
    pathname === "/categories" ||
    pathname.startsWith("/categories/")
  );
}

export function StoreLayout({ children, showFlashDeal }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayCount = isMounted ? itemCount : 0;
  const displayTotal = isMounted ? formatPKR(subtotal) : formatPKR(0);
  const flash = showFlashDeal ?? defaultShowFlashDeal(pathname);

  return (
    <div className="flex min-h-screen max-w-full flex-col overflow-x-clip bg-background">
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <TopBar />
      <Header cartCount={displayCount} cartTotal={displayTotal} />
      {flash && <FlashDeal />}
      <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
      <Footer />
      <HelpPanel />
    </div>
  );
}
