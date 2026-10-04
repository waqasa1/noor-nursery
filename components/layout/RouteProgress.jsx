"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin top progress bar for client-side navigation.
 * Starts on any internal link click, completes as soon as the URL changes
 * (pathname *or* query string) and always gives up after 20s so it can never
 * get stuck on screen.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const barRef = useRef(null);
  const timersRef = useRef([]);
  const intervalRef = useRef(null);
  const runningRef = useRef(false);
  const startHrefRef = useRef("");

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
    setBar(1, true);
    timersRef.current.push(
      setTimeout(() => {
        setVisible(false);
      }, 350)
    );
  }, [clearTimers, setBar]);

  const start = useCallback(() => {
    clearTimers();
    runningRef.current = true;
    startHrefRef.current = window.location.href;
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
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    };

    const onPopState = () => start();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
      runningRef.current = false;
    };
  }, [clearTimers, start]);

  // Backstop: path changed but the interval missed it (e.g. slow render).
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-secondary shadow-[0_0_8px_rgba(0,0,0,0.35)]" />
    </div>
  );
}
