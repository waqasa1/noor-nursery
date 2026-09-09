import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { getCategories } from "@/lib/data/products";

export const metadata = {
  title: "Plant Categories — Noor Nursery",
  description: "Browse indoor plants, outdoor plants, flowering plants, herbs, succulents, pots, and fertilizers.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <h1 className="text-center font-display text-3xl font-bold text-primary sm:text-4xl">Plant Categories</h1>
        <p className="text-urdu mt-2 text-center text-secondary" dir="rtl" lang="ur">پودوں کی اقسام</p>

        {categories.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">Categories coming soon. Browse our <Link href="/shop" className="text-secondary hover:underline">shop</Link>.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link key={cat._id} href={`/categories/${cat.slug}`} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-xl">
                {cat.image && (
                  <div className="aspect-video overflow-hidden bg-surface-low">
                    <img src={cat.image} alt={`${cat.nameEn} — ${cat.nameUr}`} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-display text-lg font-bold text-foreground">{cat.nameEn}</h2>
                  <p className="text-urdu text-secondary" dir="rtl" lang="ur">{cat.nameUr}</p>
                  {cat.descriptionEn && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{cat.descriptionEn}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
