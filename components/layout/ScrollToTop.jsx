"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Persistent store layouts keep the window scroll position across navigations.
 * Reset to top on pathname/search changes unless the URL has a hash target.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;

    // Instant reset — global smooth scroll fights App Router route changes.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, searchParams]);

  return null;
}
