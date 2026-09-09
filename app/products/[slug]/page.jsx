import { notFound } from "next/navigation";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductDetail } from "./ProductDetail";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { getEnv } from "@/lib/env";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const env = getEnv();
  return {
    title: product.seoTitle || `${product.nameEn} — Noor Nursery`,
    description: product.seoDescription || product.shortDescriptionEn,
    openGraph: {
      title: product.nameEn,
      description: product.shortDescriptionEn,
      images: product.featuredImage ? [product.featuredImage] : [],
      url: `${env.NEXT_PUBLIC_APP_URL}/products/${slug}`,
    },
    alternates: { canonical: `${env.NEXT_PUBLIC_APP_URL}/products/${slug}` },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId?._id || product.categoryId, product._id);

  return (
    <StoreLayout showFlashDeal={false}>
      <JsonLdScript data={productJsonLd(product, product.categoryId)} />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: product.nameEn },
        ])}
      />
      <ProductDetail product={JSON.parse(JSON.stringify(product))} related={JSON.parse(JSON.stringify(related))} />
    </StoreLayout>
  );
}
