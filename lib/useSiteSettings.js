"use client";

import { useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
  banner: {
    active: true,
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

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export function useSiteSettings() {
  const [settings, setSettings] = useState(cache || DEFAULT_SETTINGS);

  useEffect(() => {
    const now = Date.now();
    if (cache && now - cacheTime < CACHE_TTL) {
      setSettings(cache);
      return;
    }
    fetch("/api/site-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          const merged = {
            banner: { ...DEFAULT_SETTINGS.banner, ...data.banner },
            site_content: { ...DEFAULT_SETTINGS.site_content, ...data.site_content },
            store: { ...DEFAULT_SETTINGS.store, ...data.store },
            delivery: { ...DEFAULT_SETTINGS.delivery, ...data.delivery },
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
            faqs: Array.isArray(data.faqs) ? data.faqs : [],
          };
          cache = merged;
          cacheTime = Date.now();
          setSettings(merged);
        }
      })
      .catch(() => {});
  }, []);

  return settings;
}

/** Bust client cache after admin saves settings */
export function invalidateSiteSettingsCache() {
  cache = null;
  cacheTime = 0;
}
