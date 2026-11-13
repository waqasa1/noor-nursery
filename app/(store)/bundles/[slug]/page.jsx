import { notFound } from "next/navigation";
import { BundleDetail } from "./BundleDetail";
import { getBundleBySlug } from "@/lib/data/bundles";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { JsonLdScript } from "@/lib/seo/JsonLdScript";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";

export const revalidate = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle) return { title: "Bundle Not Found", robots: { index: false } };

  const title = bundle.nameEn;
  const description =
    bundle.descriptionEn ||
    `Buy the ${bundle.nameEn} bundle from Noor Nursery Pakistan. Fixed set price with COD and JazzCash.`;
  const image = bundle.image || DEFAULT_OG_IMAGE;
  const path = `/bundles/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "website",
      images: [{ url: image }],
    },
  };
}

export default async function BundlePage({ params }) {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle) notFound();

  return (
    <>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Bundles", url: "/bundles" },
          { name: bundle.nameEn },
        ])}
      />
      <BundleDetail bundle={bundle} />
    </>
  );
}
