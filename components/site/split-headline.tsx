"use client";

import { useRef } from "react";
import { gsap, MOTION, SplitText, useGSAP } from "@/components/site/gsap";

interface SplitHeadlineProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
  /** Play on page load (hero) instead of when scrolled into view. */
  onLoad?: boolean;
}

/** A serif headline that rises in line by line. */
export default function SplitHeadline({
  children,
  className,
  as: Tag = "h2",
  onLoad = false,
}: SplitHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION.desktop}, ${MOTION.mobile}`, () => {
        const split = SplitText.create(el, { type: "lines", mask: "lines" });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.09,
          delay: onLoad ? 0.15 : 0,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 85%", once: true },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
