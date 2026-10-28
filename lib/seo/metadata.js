import { getEnv } from "@/lib/env";

const DEFAULT_OG_IMAGE = "/heroimage-clean.png";

/**
 * Shared page metadata for storefront routes.
 * Pass path like "/about" (leading slash). Use index:false for private/utility pages.
 */
export function pageMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  index = true,
  follow = true,
}) {
  const base = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const url = path === "/" ? base : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImages = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: { index, follow },
  };
}

export { DEFAULT_OG_IMAGE };
