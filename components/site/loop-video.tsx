"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A silent looping clip that plays only while on screen. With reduced motion
 * it stays on its first frame. `controls` adds a pause/play button, required
 * for motion that runs longer than five seconds.
 */
export default function LoopVideo({
  src,
  poster,
  label,
  className = "",
  controls = false,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
  controls?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- start in the state the visitor asked for
      setPaused(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !video.dataset.userPaused) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      delete video.dataset.userPaused;
      void video.play().catch(() => {});
      setPaused(false);
    } else {
      video.dataset.userPaused = "true";
      video.pause();
      setPaused(true);
    }
  }

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className={className}
      />
      {controls && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play background video" : "Pause background video"}
          className="site-mono absolute bottom-5 right-5 z-10 flex h-11 items-center gap-2 rounded-full border border-white/15 bg-site-ink/60 px-4 text-[13px] text-site-paper backdrop-blur"
        >
          {paused ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5v11l9-5.5-9-5.5Z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
            </svg>
          )}
          {paused ? "Play" : "Pause"}
        </button>
      )}
    </>
  );
}
