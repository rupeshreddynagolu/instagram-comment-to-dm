"use client";

import { useRef } from "react";
import { gsap, MOTION, ScrollTrigger, useGSAP } from "@/components/site/gsap";
import { getLenis } from "@/components/site/smooth-scroll";

// Scroll-driven scenes. Each wraps server-rendered markup and animates the
// parts it marks with data attributes, so the content stays in the HTML and
// reads in its final state without JavaScript or with reduced motion.

/**
 * Pins the section and pans its `[data-track]` sideways as you scroll down,
 * one whole panel at a time.
 * On narrow screens and with reduced motion the panels simply stack.
 */
export function HorizontalScroll({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION.desktop, () => {
        const track = ref.current?.querySelector<HTMLElement>("[data-track]");
        if (!track) return;
        const panels = Array.from(track.children) as HTMLElement[];
        // Far enough to bring the last panel to where the first one starts,
        // so every resting point shows one whole panel.
        const distance = () =>
          panels.length > 1 ? panels[panels.length - 1].offsetLeft - panels[0].offsetLeft : 0;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        // When the scrolling stops inside the pin, glide to the nearest whole
        // panel. Done through the smooth scroller, because GSAP's own snap and
        // Lenis pull against each other and leave a panel half in view.
        const settle = () => {
          const st = tween.scrollTrigger;
          if (!st || panels.length < 2) return;
          const y = window.scrollY;
          if (y <= st.start || y >= st.end) return;
          const steps = panels.length - 1;
          const progress = (y - st.start) / (st.end - st.start);
          const target = st.start + (Math.round(progress * steps) / steps) * (st.end - st.start);
          if (Math.abs(target - y) < 2) return;
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(target, { duration: 0.6 });
          else window.scrollTo({ top: target, behavior: "smooth" });
        };
        ScrollTrigger.addEventListener("scrollEnd", settle);
        return () => ScrollTrigger.removeEventListener("scrollEnd", settle);
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Drifts its content upward a little faster than the page while in view. */
export function Parallax({
  children,
  className = "",
  distance = 80,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION.desktop, () => {
        gsap.fromTo(
          ref.current,
          { y: distance },
          {
            y: -distance,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
