"use client";

import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminAccessoryCategoriesPage() {
  return (
    <AdminLayout>
      <CategoryManager
        type="accessory"
        title="Accessory Categories"
        description="Groupings for the Accessories menu — fertilizers, pots, tools, watering and more."
      />
    </AdminLayout>
  );
}
