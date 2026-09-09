import { Suspense } from "react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ShopContent } from "./ShopContent";

export const metadata = {
  title: "Shop Plants — Noor Nursery",
  description: "Browse 300+ acclimatized indoor plants, fruit trees, herbs and more. Small, Medium, and Large sizes available with nationwide delivery.",
  robots: { index: true, follow: true },
};

export default function ShopPage() {
  return (
    <StoreLayout>
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-14 text-center">Loading plants...</div>}>
        <ShopContent />
      </Suspense>
    </StoreLayout>
  );
}
