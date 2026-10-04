"use client";

import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminPlantCategoriesPage() {
  return (
    <AdminLayout>
      <CategoryManager
        type="plant"
        title="Plant Categories"
        description="Categories shown under All Plants on the storefront — picture, name and order come from here."
      />
    </AdminLayout>
  );
}
