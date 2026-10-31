"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/components/site/gsap";

/**
 * Liquid light behind every section: a blue and an orange glow that follow
 * the cursor at different speeds and keep morphing, under the page's fine
 * vertical lines, which run through every section and light up wherever you
 * move. Touch screens get a slow drift instead; reduced motion leaves the
 * glow still.
 */
export default function LiquidCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const blue = root.querySelector<HTMLElement>("[data-blob='blue']");
      const orange = root.querySelector<HTMLElement>("[data-blob='orange']");
      const lens = root.querySelector<HTMLElement>("[data-blob='lens']");
      if (!blue || !orange || !lens) return;

      const mm = gsap.matchMedia();

      // Mouse and trackpad: follow the pointer, each layer with its own lag.
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const follow = [
          { el: lens, duration: 0.25 },
          { el: blue, duration: 0.9 },
          { el: orange, duration: 1.8 },
        ].map(({ el, duration }) => ({
          x: gsap.quickTo(el, "x", { duration, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration, ease: "power3.out" }),
        }));

        const move = (event: PointerEvent) => {
          for (const layer of follow) {
            layer.x(event.clientX);
            layer.y(event.clientY);
          }
        };
        const show = () => gsap.to([blue, orange, lens], { autoAlpha: 1, duration: 0.6 });
        const hide = () => gsap.to([blue, orange, lens], { autoAlpha: 0.35, duration: 1.2 });

        gsap.set([blue, orange, lens], { x: innerWidth / 2, y: innerHeight / 2 });
        window.addEventListener("pointermove", move, { passive: true });
        document.documentElement.addEventListener("pointerleave", hide);
        document.documentElement.addEventListener("pointerenter", show);
        return () => {
          window.removeEventListener("pointermove", move);
          document.documentElement.removeEventListener("pointerleave", hide);
          document.documentElement.removeEventListener("pointerenter", show);
        };
      });

      // Touch screens: no cursor, so the glow drifts slowly on its own.
      mm.add("(hover: none) and (prefers-reduced-motion: no-preference)", () => {
        gsap.set(lens, { autoAlpha: 0 });
        gsap.set(blue, { x: innerWidth * 0.3, y: innerHeight * 0.3 });
        gsap.set(orange, { x: innerWidth * 0.7, y: innerHeight * 0.7 });
        gsap.to(blue, { x: innerWidth * 0.7, y: innerHeight * 0.5, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.to(orange, { x: innerWidth * 0.3, y: innerHeight * 0.4, duration: 18, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

      // Reduced motion: a still, gentle glow.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(lens, { autoAlpha: 0 });
        gsap.set(blue, { x: innerWidth * 0.25, y: innerHeight * 0.3 });
        gsap.set(orange, { x: innerWidth * 0.75, y: innerHeight * 0.7 });
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div data-blob="blue" className="liquid-blob liquid-blob-blue" />
      <div data-blob="orange" className="liquid-blob liquid-blob-orange" />
      <div className="page-lines absolute inset-0" />
      <div data-blob="lens" className="liquid-lens" />
    </div>
  );
}
