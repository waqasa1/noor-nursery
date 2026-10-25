/** True while soft route feedback is active (bar / breathe animation). */
export function isRouteNavigating() {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute("data-navigating");
}

/** Signal soft navigation feedback when using router.push instead of <Link>. */
export function startRouteProgress(element) {
  if (typeof window === "undefined") return;
  if (isRouteNavigating()) return;
  window.dispatchEvent(
    new CustomEvent("route-progress:start", {
      detail: { element: element ?? null },
    })
  );
}
