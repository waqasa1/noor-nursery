"use client";

import { CategoryManager } from "@/components/admin/CategoryManager";

export default function AdminAccessoryCategoriesPage() {
  return (
    <CategoryManager
        type="accessory"
        title="Accessory Categories"
        description="Groupings for the Accessories menu — fertilizers, pots, tools, watering and more."
      />
  );
}
