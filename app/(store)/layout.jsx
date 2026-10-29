import { StoreLayout } from "@/components/layout/StoreLayout";
import { SiteSettingsProvider } from "@/lib/useSiteSettings";
import { getPublicSiteSettings } from "@/lib/site-settings.server";

/**
 * Persistent storefront chrome (header/footer). Survives client navigations so
 * loading.js only replaces page content — not the header.
 * Settings are loaded on the server so the promo banner / FAQs don't flash wrong state.
 */
export default async function StoreRootLayout({ children }) {
  const initialSettings = await getPublicSiteSettings();

  return (
    <SiteSettingsProvider initial={initialSettings}>
      <StoreLayout>{children}</StoreLayout>
    </SiteSettingsProvider>
  );
}
