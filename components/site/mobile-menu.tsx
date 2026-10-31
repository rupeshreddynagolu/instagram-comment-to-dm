"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

interface MenuLink {
  label: string;
  href: string;
  key: string;
  description: string;
}

// One small line icon per section, keyed by the link's key.
const icons: Record<string, string> = {
  templates: "M4.5 4.5h6v6h-6v-6Zm9 0h6v6h-6v-6Zm-9 9h6v6h-6v-6Zm9 0h6v6h-6v-6Z",
  product: "M4 6.5h16M4 12h10M4 17.5h7m8.5-3.5 2 2-2 2",
  "use-cases": "M12 3.5 20 8l-8 4.5L4 8l8-4.5Zm-8 9L12 17l8-4.5M4 16.5 12 21l8-4.5",
  agencies: "M8.5 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 9a5 5 0 0 1 10 0m2-9a2.5 2.5 0 1 0 0-5m1.5 14h3.5a4.5 4.5 0 0 0-5-4.5",
  pricing: "M3.5 12.5 11 5h8v8l-7.5 7.5-8-8Zm11.5-4h.01",
  "sign-in": "M14 4.5h4.5v15H14M10 8l4 4-4 4m4-4H3.5",
};

function Icon({ name }: { name: string }) {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name] ?? icons.product} />
    </svg>
  );
}

/**
 * The header's menu below desktop width: a solid panel of cards, one per
 * section, each with an icon and a line on what's there, and Sign in along
 * the bottom. It closes when a card is chosen, on Escape (returning focus to
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
        className="menu-panel absolute right-0 top-[calc(100%+0.75rem)] w-[min(24rem,calc(100vw-1.5rem))] rounded-[1.75rem] border border-white/10 bg-[#071217] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]"
      >
        <ul className="grid grid-cols-2 gap-2">
          {links.map((link) => {
            const current = active === link.key;
            return (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={current ? "page" : undefined}
                  className={`flex h-full min-h-[6.5rem] flex-col justify-between gap-3 rounded-2xl border p-3.5 transition-colors ${
                    current
                      ? "border-site-reply/40 bg-site-reply/10"
                      : "border-white/[0.07] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.07]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      current ? "bg-site-reply/20 text-[#5cc4f5]" : "bg-white/[0.06] text-site-paper"
                    }`}
                  >
                    <Icon name={link.key} />
                  </span>
                  <span>
                    <span className="flex items-center gap-1.5 text-[15px] font-semibold text-site-paper">
                      {link.label}
                      {current && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-site-marker" />}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-4 text-site-dim">{link.description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
          {/* Sign in spans the row below the section cards. */}
          <li className={links.length % 2 === 0 ? "col-span-2" : ""}>
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex h-full min-h-[6.5rem] flex-col justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition-colors hover:border-white/15 hover:bg-white/[0.07]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-site-paper">
                <Icon name="sign-in" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-site-paper">Sign in</span>
                <span className="mt-0.5 block text-[12px] leading-4 text-site-dim">Email link, no password</span>
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </details>
  );
}
