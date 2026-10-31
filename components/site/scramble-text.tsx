"use client";

import { useEffect, useRef, useState } from "react";

const glyphs = "0123456789abcdef";

/**
 * Text that resolves from noise into its final value, left to right: once when
 * it comes into view, and again whenever the card around it (`.group`) is
 * pointed at. With reduced motion it simply shows the final text.
 */
export default function ScrambleText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;

    const run = () => {
      cancelAnimationFrame(frame);
      const start = performance.now();
      const duration = 900;
      const tick = (now: number) => {
        const settled = Math.floor(((now - start) / duration) * text.length);
        setShown(
          text
            .split("")
            .map((char, index) =>
              index < settled || char === "·" ? char : glyphs[Math.floor(Math.random() * glyphs.length)]
            )
            .join("")
        );
        if (settled < text.length) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    const card = el.closest(".group");
    card?.addEventListener("pointerenter", run);
    return () => {
      observer.disconnect();
      card?.removeEventListener("pointerenter", run);
      cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
