"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Registered once for every client component that animates.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/** Media queries shared by every scene, so they agree on what to animate. */
export const MOTION = {
  /** Wide screens with motion allowed: pinned, scrubbed scenes. */
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  /** Narrow screens with motion allowed: simple reveals only. */
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  /** Reduced motion: final frames, no movement. */
  reduce: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
