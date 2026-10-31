"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/components/site/gsap";

// The running instance, so scenes can ask it to scroll (it ignores
// window.scrollTo while it is easing).
let current: Lenis | null = null;

/** The page's smooth scroller, or null with reduced motion or before mount. */
export function getLenis() {
  return current;
}

/**
 * Smooth scrolling for the public site. Lenis is driven by GSAP's ticker so
 * pinned and scrubbed ScrollTrigger scenes stay in step with the scroll.
 * Skipped entirely when the visitor prefers reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Pinned scenes add their scroll length after the first layout, so a page
    // opened at /#section lands short. Re-aim at the anchor once they settle.
    const aimAtHash = () => {
      const target = window.location.hash && document.querySelector(window.location.hash);
      if (target) lenis.scrollTo(target as HTMLElement, { immediate: true, offset: -96 });
    };
    ScrollTrigger.addEventListener("refresh", aimAtHash);
    const settle = window.setTimeout(() => ScrollTrigger.refresh(), 300);

    // The browser's own Home/End/Page/Space scrolling loses to Lenis while
    // Lenis is still easing towards its last target, so a Home press could
    // stop halfway down. Route those keys through Lenis instead. Keys typed
    // into fields, or used by focused controls, are left alone.
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role=slider], [role=listbox], [role=menu]"
        )
      ) {
        return;
      }
      const page = window.innerHeight * 0.85;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      let to: number | null = null;
      if (event.key === "Home") to = 0;
      else if (event.key === "End") to = max;
      else if (event.key === "PageDown") to = lenis.targetScroll + page;
      else if (event.key === "PageUp") to = lenis.targetScroll - page;
      else if (event.key === " " && !target?.closest("a, button, summary, [role=tab], [role=radio]")) {
        to = lenis.targetScroll + (event.shiftKey ? -page : page);
      }
      if (to === null) return;
      event.preventDefault();
      lenis.scrollTo(Math.max(0, Math.min(max, to)));
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(settle);
      ScrollTrigger.removeEventListener("refresh", aimAtHash);
      gsap.ticker.remove(tick);
      lenis.destroy();
      current = null;
    };
  }, []);

  return null;
}
