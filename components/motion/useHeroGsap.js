"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematic hero entrance + scroll parallax on the background image.
 * Hides content immediately; plays entrance when `ready` becomes true (after intro).
 */
export function useHeroGsap(rootRef, { ready = true } = {}) {
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    const root = rootRef.current;
    const ctx = gsap.context(() => {
      const image = root.querySelector("[data-hero-image]");
      const badge = root.querySelector("[data-hero-badge]");
      const words = root.querySelectorAll("[data-hero-word]");
      const lines = root.querySelectorAll("[data-hero-line]");
      const ctas = root.querySelectorAll("[data-hero-cta]");
      const stats = root.querySelectorAll("[data-hero-stat]");
      const trust = root.querySelector("[data-hero-trust]");

      gsap.set([badge, ...words, ...lines, ...ctas, ...stats], {
        opacity: 0,
      });
      gsap.set(words, { y: 70, rotateX: 55 });
      gsap.set(lines, { y: 28 });
      gsap.set(ctas, { y: 24, scale: 0.94 });
      gsap.set(stats, { y: 20 });
      if (image) gsap.set(image, { scale: 1.18 });
      if (trust) gsap.set(trust.children, { opacity: 0, y: 18 });

      if (!ready) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (image) {
        tl.to(image, { scale: 1, duration: 1.55, ease: "power2.out" }, 0);
      }

      tl.to(badge, { opacity: 1, duration: 0.55 }, 0.05)
        .to(
          words,
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power4.out",
          },
          0.18
        )
        .to(lines, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, "-=0.4")
        .to(
          ctas,
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07 },
          "-=0.28"
        )
        .to(stats, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, "-=0.22");

      if (trust) {
        tl.to(
          trust.children,
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
          "-=0.15"
        );
      }

      if (image) {
        gsap.to(image, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [rootRef, ready]);
}
