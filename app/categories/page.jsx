import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { getCategories } from "@/lib/data/products";
import { IMAGES } from "@/components/nursery/data";
import { Leaf } from "lucide-react";

export const metadata = {
  title: "Plant Categories — Noor Nursery",
  description: "Browse indoor plants, outdoor plants, flowering plants, herbs, succulents, pots, and fertilizers.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <StoreLayout>
      {/* Decorative Header */}
      <div className="relative h-64 w-full bg-primary lg:h-80">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src={IMAGES.hero} alt="Plants background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-leaf-foreground shadow-lg">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">Plant Categories</h1>
          <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">پودوں کی اقسام</p>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 py-16">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border bg-card py-20 shadow-sm">
            <p className="text-center text-muted-foreground">Categories coming soon.</p>
            <Link href="/shop" className="mt-4 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-forest">
              Browse All Plants
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link key={cat._id} href={`/categories/${cat.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-xl">
                {cat.image && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-low">
                    <img src={cat.image} alt={`${cat.nameEn} — ${cat.nameUr}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{cat.nameEn}</h2>
                    <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">{cat.nameUr}</p>
                    {cat.descriptionEn && <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{cat.descriptionEn}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
