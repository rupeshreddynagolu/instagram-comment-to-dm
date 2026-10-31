import Link from "next/link";
import SiteMark from "@/components/site-mark";
import { CONTACT_EMAIL, contactMailto } from "@/lib/contact";

const groups = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#product" },
      { label: "Use cases", href: "/#use-cases" },
      { label: "Templates", href: "/templates" },
      { label: "Security", href: "/#security" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Founding offer", href: "/#founding-offer" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Manychat alternative", href: "/manychat-alternative" },
      { label: "Comment-to-DM templates", href: "/instagram-comment-to-dm-templates" },
      { label: "For agencies", href: "/instagram-dm-automation-agencies" },
      { label: "Comment LINK automation", href: "/comment-link-automation" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact us", href: contactMailto("Hello ReplyNxt", "") },
      { label: "Sign in", href: "/login" },
      { label: "Start free", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Data deletion", href: "/data-deletion" },
      { label: "Meta review", href: "/meta-review" },
    ],
  },
];

// Links are 44px tall on touch screens and compact where there's a pointer.
const link =
  "inline-flex min-h-11 items-center text-[15px] text-site-dim transition-colors hover:text-site-paper md:min-h-8 md:text-sm";

export default function PublicSiteFooter() {
  return (
    <footer className="relative z-[1] border-t border-site-line">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 md:gap-x-8 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2.5" aria-label="ReplyNxt home">
              <SiteMark />
              <span className="text-lg font-bold tracking-tight">ReplyNxt</span>
            </Link>
            <p className="mt-3 max-w-xs text-[15px] leading-6 text-site-dim">
              Make every comment start the right DM.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="site-mono mt-4 inline-flex min-h-11 items-center gap-2 text-[13px] text-site-paper transition-colors hover:text-site-reply-hover md:min-h-8"
            >
              <svg className="h-4 w-4 text-site-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 6.5h17v11h-17v-11Zm0 0 8.5 6.5 8.5-6.5" />
              </svg>
              {CONTACT_EMAIL}
            </a>
          </div>

          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="site-mono text-[13px] text-site-paper">{group.title}</p>
              <ul className="mt-3 md:space-y-0.5">
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-site-line py-6 text-[13px] text-site-dim sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ReplyNxt. All rights reserved.</p>
          <p className="site-mono text-[12px]">Built on the official Instagram API</p>
        </div>
      </div>
    </footer>
  );
}
