"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top progress bar during client navigations.
 * Does not block clicks or freeze the current page — destination `loading.jsx` owns content loaders.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const barRef = useRef(null);
  const timersRef = useRef([]);
  const runningRef = useRef(false);
  const startKeyRef = useRef("");

  const routeKey = `${pathname}?${searchParams?.toString() || ""}`;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const setBar = useCallback((value, animate = true) => {
    const el = barRef.current;
    if (!el) return;
    el.style.transition = animate
      ? "transform 280ms cubic-bezier(0.2, 0.7, 0.3, 1)"
      : "none";
    el.style.transform = `scaleX(${value})`;
  }, []);

  const finish = useCallback(() => {
    if (!runningRef.current) {
      document.documentElement.removeAttribute("data-navigating");
      return;
    }
    clearTimers();
    runningRef.current = false;
    document.documentElement.removeAttribute("data-navigating");
    setBar(1, true);
    timersRef.current.push(
      setTimeout(() => {
        setVisible(false);
        setBar(0, false);
      }, 280)
    );
  }, [clearTimers, setBar]);

  const start = useCallback(() => {
    clearTimers();
    runningRef.current = true;
    startKeyRef.current = `${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`;
    document.documentElement.setAttribute("data-navigating", "true");
    setVisible(true);
    setBar(0, false);

    requestAnimationFrame(() => {
      if (!runningRef.current) return;
      setBar(0.22, true);
      timersRef.current.push(setTimeout(() => runningRef.current && setBar(0.48), 200));
      timersRef.current.push(setTimeout(() => runningRef.current && setBar(0.72), 600));
      timersRef.current.push(setTimeout(() => runningRef.current && setBar(0.88), 1400));
      // Safety: never leave the bar stuck if the route key does not change
      timersRef.current.push(setTimeout(finish, 8000));
    });
  }, [clearTimers, finish, setBar]);

  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target?.closest?.("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download") || anchor.hasAttribute("data-no-progress")) return;

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      // Never preventDefault — navigation must always proceed
      start();
    };

    const onProgrammatic = () => {
      start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("route-progress:start", onProgrammatic);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("route-progress:start", onProgrammatic);
      clearTimers();
    };
  }, [clearTimers, start]);

  // Finish when the App Router commits a new URL
  useEffect(() => {
    if (!runningRef.current) return;
    if (routeKey !== startKeyRef.current) {
      finish();
    }
  }, [routeKey, finish]);

  // Clear stranded state on bfcache restore; start bar on back/forward
  useEffect(() => {
    const onPageShow = () => {
      if (!runningRef.current) {
        document.documentElement.removeAttribute("data-navigating");
        return;
      }
      const now = `${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`;
      if (now !== startKeyRef.current) finish();
    };
    const onPopState = () => {
      if (!runningRef.current) start();
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
    };
  }, [finish, start]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-secondary"
      />
    </div>
  );
}
