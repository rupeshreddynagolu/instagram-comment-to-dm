"use client";

import { useRef } from "react";
import { gsap, MOTION, useGSAP } from "@/components/site/gsap";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Animate direct children one after another instead of the block as one. */
  stagger?: boolean;
  as?: "div" | "section" | "ul" | "ol" | "dl";
  /**
   * Play as the page loads, after this many seconds, instead of waiting for a
   * scroll. For content in the first screen, which may never be scrolled into
   * the trigger zone.
   */
  onLoadDelay?: number;
}

/**
 * Fades content up as it scrolls into view. With reduced motion the content
 * is simply there; nothing is hidden before JavaScript runs.
 */
export default function Reveal({
  children,
  className,
  stagger = false,
  as: Tag = "div",
  onLoadDelay,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION.desktop}, ${MOTION.mobile}`, () => {
        const targets = stagger ? Array.from(el.children) : [el];
        gsap.from(targets, {
          autoAlpha: 0,
          y: 32,
          duration: 0.9,
          ease: "power3.out",
          stagger: stagger ? 0.08 : 0,
          delay: onLoadDelay ?? 0,
          scrollTrigger:
            onLoadDelay === undefined
              ? { trigger: el, start: "top 85%", once: true }
              : undefined,
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}
