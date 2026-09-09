import { notFound } from "next/navigation";
import Link from "next/link";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { CatalogProductCard } from "@/components/catalog/ProductCard";
import { getCategoryBySlug, getProducts } from "@/lib/data/products";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.nameEn} — Noor Nursery`,
    description: category.descriptionEn || category.seoDescription,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products } = await getProducts({ category: slug, limit: 24 });

  return (
    <StoreLayout>
      <JsonLdScript data={breadcrumbJsonLd([{ name: "Home", url: "/" }, { name: "Categories", url: "/categories" }, { name: category.nameEn }])} />
      <div className="mx-auto max-w-7xl px-4 py-14">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/categories" className="hover:text-secondary">Categories</Link> / {category.nameEn}
        </nav>
        <h1 className="font-display text-3xl font-bold text-primary">{category.nameEn}</h1>
        <p className="text-urdu mt-1 text-xl text-secondary" dir="rtl" lang="ur">{category.nameUr}</p>
        {category.descriptionEn && (
          <div className="mt-4 max-w-2xl">
            <p className="text-muted-foreground">{category.descriptionEn}</p>
            {category.descriptionUr && (
              <p className="text-urdu mt-2 text-muted-foreground" dir="rtl" lang="ur">{category.descriptionUr}</p>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <CatalogProductCard key={p._id} product={p} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">No products in this category yet.</p>
        )}
      </div>
    </StoreLayout>
  );
}
