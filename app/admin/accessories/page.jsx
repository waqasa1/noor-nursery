"use client";

import { ProductList } from "@/components/admin/ProductList";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminAccessoriesPage() {
  return (
    <AdminLayout>
      <ProductList
        type="accessory"
        title="All Accessories"
        addHref="/admin/products/new?type=accessory"
        addLabel="Add Accessory"
      />
    </AdminLayout>
  );
}
