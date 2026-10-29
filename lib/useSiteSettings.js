"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const DEFAULT_SETTINGS = {
  banner: {
    // Off until real settings load — avoids promo banner flash when admin hid it
    active: false,
    text: "Limited offer:",
    subtext: "Flat 20% off your order — free shipping over PKR 2,500",
    code: "NOOR20",
  },
  site_content: {
    heroImage: "",
    indoorImage: "",
    aboutImage: "",
    facebookUrl: "https://www.facebook.com/Noor.Nursery.24hr",
    instagramUrl: "https://www.instagram.com/noornursery_official/",
    copyrightText: "Noor Nursery Pakistan. All rights reserved.",
  },
  store: {
    phone: "",
  },
  delivery: {
    freeThreshold: 2500,
  },
  testimonials: [],
  faqs: [],
};

const SiteSettingsContext = createContext(DEFAULT_SETTINGS);

export function mergeSiteSettings(data) {
  if (!data || typeof data !== "object") return DEFAULT_SETTINGS;
  return {
    banner: { ...DEFAULT_SETTINGS.banner, ...data.banner },
    site_content: { ...DEFAULT_SETTINGS.site_content, ...data.site_content },
    store: { ...DEFAULT_SETTINGS.store, ...data.store },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...data.delivery },
    testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
  };
}

async function fetchSiteSettings() {
  const res = await fetch("/api/site-settings");
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.success) return null;
  return mergeSiteSettings(data);
}

/**
 * Provide SSR-fetched settings so banner / testimonials / FAQ don't flash wrong state.
 * `initial` must be a plain object from the server layout.
 */
export function SiteSettingsProvider({ initial = null, children }) {
  const [settings, setSettings] = useState(() =>
    initial ? mergeSiteSettings(initial) : DEFAULT_SETTINGS
  );

  const refresh = useCallback(() => {
    fetchSiteSettings()
      .then((merged) => {
        if (merged) setSettings(merged);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onInvalidate = () => refresh();
    window.addEventListener("site-settings-changed", onInvalidate);
    return () => window.removeEventListener("site-settings-changed", onInvalidate);
  }, [refresh]);

  return (
    <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

/** Bust client settings after admin saves — storefront provider refetches */
export function invalidateSiteSettingsCache() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("site-settings-changed"));
  }
}
