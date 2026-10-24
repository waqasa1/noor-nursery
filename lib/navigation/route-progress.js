/** Signal soft navigation feedback when using router.push instead of <Link>. */
export function startRouteProgress(element) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("route-progress:start", {
      detail: { element: element ?? null },
    })
  );
}
