"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

interface MenuLink {
  label: string;
  href: string;
  key: string;
}

/**
 * The header's menu below desktop width: a solid panel under the bar. It
 * closes when a link is chosen, on Escape (returning focus to the button), and
 * on a tap outside. Without JavaScript the <details> still opens and closes.
 */
export default function MobileMenu({
  links,
  active,
  className = "",
}: {
  links: MenuLink[];
  active?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const close = () => {
      details.open = false;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.open) {
        close();
        details.querySelector("summary")?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <details ref={ref} className={`group relative ${className}`}>
      <summary
        aria-label="Menu"
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full text-site-paper transition-colors hover:bg-white/5 md:h-9 md:w-9 [&::-webkit-details-marker]:hidden"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
          <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
        </svg>
      </summary>
      <nav
        aria-label="Main"
        className="menu-panel absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-white/10 bg-[#071217] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <ul>
          {links.map((link) => (
            <li key={link.key}>
              <Link
                href={link.href}
                onClick={() => {
                  if (ref.current) ref.current.open = false;
                }}
                aria-current={active === link.key ? "page" : undefined}
                className="flex min-h-12 items-center justify-between rounded-2xl px-4 text-[16px] text-site-paper transition-colors hover:bg-white/[0.06]"
              >
                {link.label}
                {active === link.key ? (
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-site-marker" />
                ) : (
                  <svg className="h-4 w-4 text-site-dim" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 3.5 10.5 8 6 12.5" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
