"use client";

import { ProductList } from "@/components/admin/ProductList";

export default function AdminAccessoriesPage() {
  return (
    <ProductList
        type="accessory"
        title="All Accessories"
        addHref="/admin/products/new?type=accessory"
        addLabel="Add Accessory"
      />
  );
}
