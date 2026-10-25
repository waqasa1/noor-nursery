"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top progress bar + subtle “still on this page” cues while the next route loads:
 * - document.documentElement[data-navigating] → soft brand/header pulse
 * - clicked <a>.is-nav-pending → breathing highlight on that link/card
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const barRef = useRef(null);
  const timersRef = useRef([]);
  const intervalRef = useRef(null);
  const runningRef = useRef(false);
  const startHrefRef = useRef("");
  const pendingElRef = useRef(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearPending = useCallback(() => {
    const el = pendingElRef.current;
    if (el) {
      el.classList.remove("is-nav-pending");
      el.removeAttribute("aria-busy");
      el.removeAttribute("aria-disabled");
    }
    pendingElRef.current = null;
    document.documentElement.removeAttribute("data-navigating");
  }, []);

  const setBar = useCallback((value, animate = true) => {
    const el = barRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 300ms cubic-bezier(0.2, 0.7, 0.3, 1)" : "none";
    el.style.transform = `scaleX(${value})`;
  }, []);

  const finish = useCallback(() => {
    if (!runningRef.current) return;
    clearTimers();
    runningRef.current = false;
    clearPending();
    setBar(1, true);
    timersRef.current.push(
      setTimeout(() => {
        setVisible(false);
      }, 350)
    );
  }, [clearPending, clearTimers, setBar]);

  const start = useCallback(
    (clickedAnchor) => {
      if (runningRef.current) return;

      clearTimers();
      clearPending();
      runningRef.current = true;
      startHrefRef.current = window.location.href;
      document.documentElement.setAttribute("data-navigating", "true");

      if (clickedAnchor instanceof HTMLElement) {
        const target =
          clickedAnchor.closest("[data-nav-pulse]") ||
          clickedAnchor.closest("article") ||
          clickedAnchor;
        target.classList.add("is-nav-pending");
        target.setAttribute("aria-busy", "true");
        if (target.tagName === "A" || target.tagName === "BUTTON") {
          target.setAttribute("aria-disabled", "true");
        }
        pendingElRef.current = target;
      }

      setVisible(true);
      setBar(0, false);

      requestAnimationFrame(() => {
        if (!runningRef.current) return;
        setBar(0.2, true);
        timersRef.current.push(setTimeout(() => runningRef.current && setBar(0.45), 250));
        timersRef.current.push(setTimeout(() => runningRef.current && setBar(0.68), 700));
        timersRef.current.push(setTimeout(() => runningRef.current && setBar(0.84), 1500));
        timersRef.current.push(setTimeout(finish, 20000));
        intervalRef.current = setInterval(() => {
          if (window.location.href !== startHrefRef.current) finish();
        }, 120);
      });
    },
    [clearPending, clearTimers, finish, setBar]
  );

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
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      // Block repeat clicks while the breathe/loading cue is active
      if (runningRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      start(anchor);
    };

    const onPopState = () => {
      if (!runningRef.current) start(null);
    };

    /** For router.push() flows (product cards, search) that never hit an <a> click. */
    const onProgrammatic = (event) => {
      if (runningRef.current) return;
      const el = event.detail?.element ?? null;
      start(el);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("route-progress:start", onProgrammatic);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("route-progress:start", onProgrammatic);
      clearTimers();
      clearPending();
      runningRef.current = false;
    };
  }, [clearPending, clearTimers, start]);

  // Finish when the destination route is committed (path or query).
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-secondary shadow-[0_0_8px_rgba(0,0,0,0.35)]"
      />
    </div>
  );
}
