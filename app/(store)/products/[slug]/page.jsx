import { notFound } from "next/navigation";
import { ProductDetail } from "./ProductDetail";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { serializeProduct, serializeProducts } from "@/lib/utils/serialize";
import { productJsonLd, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found", robots: { index: false } };

  const title = product.seoTitle || product.nameEn;
  const description =
    product.seoDescription ||
    product.shortDescriptionEn ||
    `Buy ${product.nameEn} online from Noor Nursery Pakistan. COD and JazzCash available.`;
  const image = product.featuredImage || product.images?.[0] || DEFAULT_OG_IMAGE;
  const path = `/products/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: product.nameEn,
      description,
      url: absoluteUrl(path),
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.nameEn,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId?._id || product.categoryId, product._id);

  return (
    <>
      <JsonLdScript data={productJsonLd(product, product.categoryId)} />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: product.nameEn },
        ])}
      />
      <ProductDetail product={serializeProduct(product)} related={serializeProducts(related)} />
    </>
  );
}
