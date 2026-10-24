"use client";

import { CategoryManager } from "@/components/admin/CategoryManager";

export default function AdminPlantCategoriesPage() {
  return (
    <CategoryManager
        type="plant"
        title="Plant Categories"
        description="Categories shown under All Plants on the storefront — picture, name and order come from here."
      />
  );
}
