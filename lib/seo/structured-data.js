import { getEnv } from "../env";

export function organizationJsonLd() {
  const env = getEnv();
  return {
    "@context": "https://schema.org",
    "@type": "GardenStore",
    name: env.NEXT_PUBLIC_STORE_NAME || "Noor Nursery",
    url: env.NEXT_PUBLIC_APP_URL,
    telephone: env.NEXT_PUBLIC_STORE_PHONE,
    email: env.NEXT_PUBLIC_STORE_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressLocality: env.NEXT_PUBLIC_STORE_ADDRESS || "Lahore",
    },
    priceRange: "$$",
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash, Credit Card, Mobile Payment",
  };
}

export function productJsonLd(product, category) {
  const env = getEnv();
  const activeVariants = product.variants?.filter((v) => v.isActive) || [];
  const lowestPrice = activeVariants.length
    ? Math.min(...activeVariants.map((v) => v.price))
    : 0;
  const inStock = activeVariants.some((v) => v.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    alternateName: product.nameUr,
    description: product.shortDescriptionEn || product.descriptionEn,
    image: product.featuredImage || product.images?.[0],
    sku: activeVariants[0]?.sku,
    brand: { "@type": "Brand", name: "Noor Nursery" },
    category: category?.nameEn,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PKR",
      lowPrice: lowestPrice,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
    },
  };
}

export function breadcrumbJsonLd(items) {
  const env = getEnv();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url ? `${env.NEXT_PUBLIC_APP_URL}${item.url}` : undefined,
    })),
  };
}

export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q || f.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a || f.answerEn,
      },
    })),
  };
}
