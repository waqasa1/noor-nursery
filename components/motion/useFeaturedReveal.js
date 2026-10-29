"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Big scroll "wow" for the featured plant section */
export function useFeaturedReveal(rootRef) {
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    const root = rootRef.current;
    const ctx = gsap.context(() => {
      const media = root.querySelector("[data-featured-media]");
      const copy = root.querySelector("[data-featured-copy]");

      if (media) {
        gsap.fromTo(
          media,
          { clipPath: "inset(18% 18% 18% 18% round 2rem)", scale: 1.15 },
          {
            clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 75%",
              end: "top 25%",
              scrub: 1,
            },
          }
        );
      }

      if (copy) {
        gsap.from(copy.children, {
          opacity: 0,
          x: 40,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 65%",
            once: true,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}
