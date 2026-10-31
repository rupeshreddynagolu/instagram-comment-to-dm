import Link from "next/link";
import SiteMark from "@/components/site-mark";
import MobileMenu from "@/components/site/mobile-menu";

export type SiteSection = "home" | "templates" | "agencies";

interface PublicSiteHeaderProps {
  active?: SiteSection;
}

// The description shows only in the card menu on phones and tablets.
const navLinks = [
  { label: "Templates", href: "/templates", key: "templates", description: "Ready-made campaigns" },
  { label: "Product", href: "/#product", key: "product", description: "How it works" },
  { label: "Use cases", href: "/#use-cases", key: "use-cases", description: "Stores, creators, guides" },
  { label: "Agencies", href: "/instagram-dm-automation-agencies", key: "agencies", description: "Run client campaigns" },
  { label: "Pricing", href: "/#pricing", key: "pricing", description: "Free, Pro and Agency" },
];

// Every item in the bar shares one face, size and height.
const item =
  "site-mono inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors md:min-h-9";

/**
 * The site header on every public page: one floating glass bar holding the
 * mark, the sections and Sign in. Below desktop width the sections move into
 * a card menu.
 */
export default function PublicSiteHeader({ active }: PublicSiteHeaderProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="glass pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between gap-2 rounded-full p-1.5 pl-4">
        <Link href="/" className={`${item} -ml-2 font-semibold text-site-paper`} aria-label="ReplyNxt home">
          <SiteMark className="h-6 w-6" />
          <span className="text-[15px] tracking-tight">ReplyNxt</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={active === link.key ? "page" : undefined}
              className={`${item} ${
                active === link.key
                  ? "text-site-paper"
                  : "text-site-dim hover:text-site-paper"
              }`}
            >
              {active === link.key && (
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-site-marker" />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {/* The bar's one action on desktop. Below that, Sign in is a card in
              the menu instead. Starting free lives on the page itself. */}
          <Link
            href="/login"
            className={`${item} border border-white/15 px-4 text-site-paper hover:border-white/30 hover:bg-white/5 max-lg:hidden`}
          >
            Sign in
          </Link>

          <MobileMenu className="lg:hidden" active={active} links={navLinks} />
        </div>
      </div>
    </header>
  );
}
