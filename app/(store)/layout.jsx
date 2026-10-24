import { StoreLayout } from "@/components/layout/StoreLayout";

/**
 * Persistent storefront chrome (header/footer). Survives client navigations so
 * loading.js only replaces page content — not the header.
 */
export default function StoreRootLayout({ children }) {
  return <StoreLayout>{children}</StoreLayout>;
}
