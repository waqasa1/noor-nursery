/** Soft top-bar cue for router.push() navigations (does not block clicks). */
export function startRouteProgress() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("route-progress:start"));
}

/** @deprecated No longer gates navigation — always false so clicks are never swallowed. */
export function isRouteNavigating() {
  return false;
}
