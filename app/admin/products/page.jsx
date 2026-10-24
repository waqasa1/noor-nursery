"use client";

import { ProductList } from "@/components/admin/ProductList";

export default function AdminPlantsPage() {
  return (
    <ProductList
        type="plant"
        title="All Plants"
        addHref="/admin/products/new?type=plant"
        addLabel="Add Plant"
      />
  );
}
