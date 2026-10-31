"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

interface MenuLink {
  label: string;
  href: string;
  key: string;
  description: string;
}

/* Each card's preview: a tiny piece of what's on that page, drawn in the
   site's own language (keyword marks, DM bubbles, prices), not an icon. */

function ProductPreview() {
  return (
    <span aria-hidden="true" className="flex items-center gap-2">
      <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] text-site-paper">
        <mark className="marker text-[10px]">LINK</mark> please
      </span>
      <svg className="h-3.5 w-3.5 shrink-0 text-site-dim" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5" />
      </svg>
      <span className="rounded-full rounded-br-md bg-site-reply px-2.5 py-1 text-[11px] text-white">
        Here&apos;s your link
      </span>
    </span>
  );
}

function TemplatesPreview() {
  return (
    <span aria-hidden="true" className="flex flex-wrap gap-1">
      {["LINK", "PRICE", "GUIDE"].map((word) => (
        <mark key={word} className="marker text-[10px]">
          {word}
        </mark>
      ))}
    </span>
  );
}

function UseCasesPreview() {
  return (
    <span aria-hidden="true" className="flex -space-x-1.5">
      {[
        ["S", "bg-[#5c2a12]"],
        ["C", "bg-[#0b3a57]"],
        ["G", "bg-[#1f3a2e]"],
      ].map(([letter, tone]) => (
        <span
          key={letter}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b181e] text-[10px] font-semibold text-white ${tone}`}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

function AgenciesPreview() {
  return (
    <span aria-hidden="true" className="flex items-end gap-[3px]">
      {[40, 65, 50, 85, 70].map((height, index) => (
        <span
          key={index}
          className={`w-1.5 rounded-t-sm ${index === 3 ? "bg-site-marker" : "bg-site-reply/70"}`}
          style={{ height: `${height * 0.28}px` }}
        />
      ))}
    </span>
  );
}

function PricingPreview() {
  return (
    <span aria-hidden="true" className="flex items-baseline gap-1">
      <span className="site-mono text-[10px] text-site-dim">from</span>
      <span className="display text-2xl leading-none text-site-paper">₹0</span>
    </span>
  );
}

const previews: Record<string, () => React.ReactElement> = {
  product: ProductPreview,
  templates: TemplatesPreview,
  "use-cases": UseCasesPreview,
  agencies: AgenciesPreview,
  pricing: PricingPreview,
};

function Chevron() {
  return (
    <svg className="h-4 w-4 text-site-dim transition-transform group-hover/card:translate-x-0.5 group-hover/card:text-site-paper motion-reduce:transition-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

/**
 * The header's menu below desktop width: a solid panel of cards. Product is
 * the wide card on top; the others sit two by two, each with a small preview
 * of its page; Sign in runs along the bottom. Cards fade in one after another
 * as it opens. It closes when a card is chosen, on Escape (returning focus to
 * the button), and on a tap outside. Without JavaScript the <details> still
 * opens and closes.
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

  const closeMenu = () => {
    if (ref.current) ref.current.open = false;
  };

  // Product leads as the wide card; the rest follow in their usual order.
  const ordered = [
    ...links.filter((link) => link.key === "product"),
    ...links.filter((link) => link.key !== "product"),
  ];

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
        className="menu-panel absolute right-0 top-[calc(100%+0.75rem)] w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#071217] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]"
      >
        {/* A soft light in the panel's corner, like the page's beam. */}
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-site-reply/20 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-site-marker/10 blur-3xl" />

        <ul className="relative grid grid-cols-2 gap-2">
          {ordered.map((link, index) => {
            const current = active === link.key;
            const wide = link.key === "product";
            const Preview = previews[link.key];
            return (
              <li key={link.key} className={`menu-card ${wide ? "col-span-2" : ""}`} style={{ "--i": index } as React.CSSProperties}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={current ? "page" : undefined}
                  className={`group/card flex h-full flex-col justify-between gap-4 rounded-2xl border p-3.5 transition-colors ${
                    wide ? "min-h-[7rem]" : "min-h-[7.5rem]"
                  } ${
                    current
                      ? "border-site-reply/40 bg-site-reply/10"
                      : "border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.015] hover:border-white/20"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    {Preview && <Preview />}
                    {wide && <Chevron />}
                  </span>
                  <span className="flex items-end justify-between gap-2">
                    <span>
                      <span className="flex items-center gap-1.5 text-[15px] font-semibold text-site-paper">
                        {link.label}
                        {current && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-site-marker" />}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-4 text-site-dim">{link.description}</span>
                    </span>
                    {!wide && <Chevron />}
                  </span>
                </Link>
              </li>
            );
          })}

          {/* Sign in along the bottom, as a slim row. */}
          <li className="menu-card col-span-2" style={{ "--i": ordered.length } as React.CSSProperties}>
            <Link
              href="/login"
              onClick={closeMenu}
              className="group/card flex min-h-12 items-center gap-3 rounded-2xl border border-white/[0.07] px-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <svg className="h-[18px] w-[18px] text-site-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 6.5h17v11h-17v-11Zm0 0 8.5 6.5 8.5-6.5" />
              </svg>
              <span className="text-[15px] font-semibold text-site-paper">Sign in</span>
              <span className="text-[12px] text-site-dim">Email link, no password</span>
              <span className="ml-auto">
                <Chevron />
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </details>
  );
}
