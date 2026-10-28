import { getEnv } from "../env";

function baseUrl() {
  return getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}

/** Turn relative site paths into absolute URLs for JSON-LD / social crawlers. */
export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = baseUrl();
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function organizationJsonLd() {
  const env = getEnv();
  const url = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "GardenStore",
    name: env.NEXT_PUBLIC_STORE_NAME || "Noor Nursery",
    url,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/heroimage-clean.png"),
    telephone: env.NEXT_PUBLIC_STORE_PHONE,
    email: env.NEXT_PUBLIC_STORE_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressLocality: env.NEXT_PUBLIC_STORE_ADDRESS || "Karachi",
    },
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    priceRange: "$$",
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash on Delivery, JazzCash",
    sameAs: ["https://www.facebook.com/Noor.Nursery.24hr"],
  };
}

/** Enables Google sitelinks search box when eligible. */
export function websiteJsonLd() {
  const url = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Noor Nursery",
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product, category) {
  const activeVariants = product.variants?.filter((v) => v.isActive) || [];
  const lowestPrice = activeVariants.length
    ? Math.min(...activeVariants.map((v) => v.price))
    : 0;
  const highestPrice = activeVariants.length
    ? Math.max(...activeVariants.map((v) => v.price))
    : lowestPrice;
  const inStock = activeVariants.some((v) => v.stock > 0);
  const images = [product.featuredImage, ...(product.images || [])]
    .filter(Boolean)
    .map(absoluteUrl)
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn,
    alternateName: product.nameUr || undefined,
    description: product.shortDescriptionEn || product.descriptionEn,
    image: images.length ? images : undefined,
    sku: activeVariants[0]?.sku,
    brand: { "@type": "Brand", name: "Noor Nursery" },
    category: category?.nameEn,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PKR",
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      offerCount: activeVariants.length || 1,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/products/${product.slug}`),
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url ? absoluteUrl(item.url) : undefined,
    })),
  };
}

export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (faqs || []).map((f) => ({
      "@type": "Question",
      name: f.q || f.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a || f.answerEn,
      },
    })),
  };
}
