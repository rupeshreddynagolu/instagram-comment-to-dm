"use client";

import { useEffect, useRef } from "react";

/**
 * Marks its element `data-armed` once JavaScript runs and `data-inview` the
 * first time it is mostly on screen, so CSS can play a card's small sequence
 * exactly once, on phones as well as with a pointer. Without JavaScript the
 * element is never armed and everything shows in its final state.
 */
export default function InView({
  as: Tag = "div",
  className,
  children,
  threshold = 0.35,
}: {
  as?: "div" | "article" | "section";
  className?: string;
  children: React.ReactNode;
  threshold?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.armed = "";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.inview = "";
        observer.disconnect();
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}
