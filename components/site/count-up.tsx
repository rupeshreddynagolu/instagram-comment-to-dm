"use client";

import { useRef } from "react";
import { gsap, MOTION, useGSAP } from "@/components/site/gsap";

/**
 * A number that counts up from zero when it scrolls into view. The final
 * value is in the markup, so it reads correctly without JavaScript or motion.
 */
export default function CountUp({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    `${n.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION.desktop}, ${MOTION.mobile}`, () => {
        const counter = { n: 0 };
        gsap.to(counter, {
          n: value,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = format(counter.n);
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}
