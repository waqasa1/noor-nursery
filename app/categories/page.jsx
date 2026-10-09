import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { getCategories } from "@/lib/data/products";
import { IMAGES } from "@/components/nursery/data";
import { Leaf, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Categories — Noor Nursery",
  description: "Browse indoor plants, fruit plants, flowering plants, herbs, pots, fertilizers and garden accessories.",
};

export const revalidate = 60;

function CategoryCard({ cat, badge }) {
  return (
    <Link
      href={`/categories/${cat.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-xl"
    >
      {cat.image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-low">
          <img
            src={cat.image}
            alt={`${cat.nameEn} — ${cat.nameUr}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase text-secondary-foreground">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {cat.nameEn}
          </h3>
          <p className="text-urdu mt-1 text-secondary" dir="rtl" lang="ur">
            {cat.nameUr}
          </p>
          {cat.descriptionEn && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {cat.descriptionEn}
            </p>
          )}
        </div>
        <span className="mt-5 text-sm font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Browse →
        </span>
      </div>
    </Link>
  );
}

export default async function CategoriesPage() {
  let categories = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error("[categories] Failed to load:", error.message);
  }
  const plants = categories.filter((c) => c.type !== "accessory");
  const accessories = categories.filter((c) => c.type === "accessory");

  const sections = [
    {
      key: "plant",
      title: "Plant Categories",
      titleUr: "پودوں کی اقسام",
      href: "/shop?type=plants",
      cta: "All Plants",
      items: plants,
    },
    {
      key: "accessory",
      title: "Accessories",
      titleUr: "گارڈننگ کا سامان",
      href: "/shop?type=accessories",
      cta: "All Accessories",
      items: accessories,
    },
  ].filter((s) => s.items.length > 0);

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
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Categories
          </h1>
          <p className="text-urdu mt-3 text-xl text-primary-foreground/90" dir="rtl" lang="ur">
            ہماری تمام اقسام
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16">
        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border bg-card py-20 shadow-sm">
            <p className="text-center text-muted-foreground">Categories coming soon.</p>
            <Link
              href="/shop?type=plants"
              className="mt-4 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-forest"
            >
              Browse All Plants
            </Link>
          </div>
        )}

        {sections.map((section) => (
          <section key={section.key} aria-labelledby={`cat-${section.key}`}>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground/10 pb-4">
              <div>
                <h2 id={`cat-${section.key}`} className="font-display text-3xl font-bold text-primary">
                  {section.title}
                </h2>
                <p className="text-urdu mt-1 text-lg text-secondary" dir="rtl" lang="ur">
                  {section.titleUr}
                </p>
              </div>
              <Link
                href={section.href}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-forest"
              >
                {section.key === "accessory" ? (
                  <ShoppingBag className="h-4 w-4" />
                ) : (
                  <Leaf className="h-4 w-4" />
                )}
                {section.cta}
              </Link>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((cat) => (
                <CategoryCard key={cat._id} cat={cat} badge={section.key === "accessory" ? "Accessory" : undefined} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </StoreLayout>
  );
}
