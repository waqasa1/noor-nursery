"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal carousel with arrows.
 * Card widths use vw (not % of the flex track) so items can't inflate page width.
 */
export function Carousel({
  children,
  className = "",
  label = "Carousel",
  autoplay = false,
  intervalMs = 4500,
}) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 4;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, children]);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-carousel-item]");
    const amount = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoplay) return undefined;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth - 4;
      if (el.scrollLeft >= max) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoplay, intervalMs]);

  return (
    <div className={`relative max-w-full min-w-0 overflow-x-clip ${className}`}>
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label={`Previous ${label}`}
          disabled={!canPrev}
          onClick={() => scrollByCard(-1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-primary shadow-sm transition hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={`Next ${label}`}
          disabled={!canNext}
          onClick={() => scrollByCard(1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-primary shadow-sm transition hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        className="flex max-w-full min-w-0 items-stretch snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

export function CarouselItem({ children, className = "" }) {
  // vw-based widths (~1.5 / 2.5 / 3.5 visible) — never % of an indefinite flex track
  return (
    <div
      data-carousel-item
      className={`flex w-[min(72vw,16.5rem)] shrink-0 snap-start flex-col sm:w-[min(40vw,17rem)] lg:w-[min(26vw,18rem)] ${className}`}
    >
      {children}
    </div>
  );
}
