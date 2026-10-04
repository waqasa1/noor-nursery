"use client";

import { ProductList } from "@/components/admin/ProductList";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminPlantsPage() {
  return (
    <AdminLayout>
      <ProductList
        type="plant"
        title="All Plants"
        addHref="/admin/products/new?type=plant"
        addLabel="Add Plant"
      />
    </AdminLayout>
  );
}
