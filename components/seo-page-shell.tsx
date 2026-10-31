import Link from "next/link";
import SiteShell from "@/components/site-shell";
import CtaButton from "@/components/site/cta-button";
import { GlassCard, SectionHeading } from "@/components/site/primitives";
import Reveal from "@/components/site/reveal";
import SplitHeadline from "@/components/site/split-headline";

export interface SeoPageSection {
  title: string;
  body: string;
}

export interface SeoPageConfig {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta?: { label: string; href: string };
  /** What the reader gets, as short lines for the card beside the headline. */
  bullets: string[];
  /** Heading over the three sections. */
  sectionsTitle: string;
  sections: SeoPageSection[];
  comparisonTitle: string;
  /** Name for the other column, e.g. "Manual replies". */
  comparisonOther: string;
  comparisons: Array<{
    label: string;
    replynxt: string;
    other: string;
  }>;
  templateLinks: Array<{
    label: string;
    keywords: string[];
    href: string;
  }>;
  faqs: SeoPageSection[];
}

/** Marks the all-caps comment keywords (LINK, PRICE, ...) inside a sentence. */
function WithMarkedKeywords({ text }: { text: string }) {
  return (
    <>
      {text.split(/\b([A-Z]{3,})\b/).map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="marker">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function Tick() {
  return (
    <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-site-reply/15 text-site-reply">
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.3a1 1 0 0 1-1.42 0L4.78 10.7a1 1 0 1 1 1.42-1.4l2.54 2.56 6.54-6.6a1 1 0 0 1 1.42.04Z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function Chevron({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

const section = "mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28";

/**
 * The guide pages (Manychat alternative, templates, agencies, comment LINK):
 * the home page's type, glass cards and buttons, with one config per page.
 */
export default function SeoPageShell({
  config,
  active,
}: {
  config: SeoPageConfig;
  active?: "agencies";
}) {
  const [lead, ...rest] = config.sections;
  const secondary = config.secondaryCta ?? { label: "Browse templates", href: "/templates" };

  return (
    <SiteShell active={active}>
      {/* Headline and the short "what you get" card. */}
      <section className="mx-auto grid w-full max-w-6xl items-start gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div>
          <Reveal onLoadDelay={0}>
            <p className="site-mono text-[13px] text-site-paper">{config.eyebrow}</p>
          </Reveal>
          <SplitHeadline
            as="h1"
            onLoad
            className="mt-4 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02]"
          >
            {config.title}
          </SplitHeadline>
          <Reveal onLoadDelay={0.4}>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-site-paper/85">
              <WithMarkedKeywords text={config.description} />
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/login" size="lg">
                {config.primaryCta}
              </CtaButton>
              <CtaButton href={secondary.href} size="lg" variant="secondary">
                {secondary.label}
              </CtaButton>
            </div>
          </Reveal>
        </div>

        <Reveal onLoadDelay={0.55}>
          <GlassCard as="aside" className="p-6 sm:p-7">
            <p className="site-mono text-[13px] text-site-dim">What you get</p>
            <ul className="mt-5 space-y-4">
              {config.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-[15px] leading-6">
                  <Tick />
                  <span>
                    <WithMarkedKeywords text={bullet} />
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </Reveal>
      </section>

      {/* The three ideas: one large card, two beside it. */}
      <section className={section}>
        <SectionHeading label="Why it fits" title={config.sectionsTitle} />
        <Reveal stagger className="mt-12 grid gap-4 md:grid-cols-2">
          <GlassCard as="article" className="flex flex-col justify-end p-7 sm:p-9 md:row-span-2 md:min-h-[22rem]">
            <h3 className="display text-3xl leading-tight sm:text-4xl">{lead.title}</h3>
            <p className="mt-4 max-w-md text-lg leading-8 text-site-dim">
              <WithMarkedKeywords text={lead.body} />
            </p>
          </GlassCard>
          {rest.map((item) => (
            <GlassCard key={item.title} as="article" className="p-7">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-site-dim">
                <WithMarkedKeywords text={item.body} />
              </p>
            </GlassCard>
          ))}
        </Reveal>
      </section>

      {/* Comparison: rows of three on wide screens, stacked pairs on phones. */}
      <section className={section}>
        <SectionHeading label="Side by side" title={config.comparisonTitle} />
        <GlassCard className="mt-12 overflow-hidden">
          <div className="site-mono hidden grid-cols-[0.6fr_1fr_1fr] gap-6 border-b border-white/10 px-7 py-4 text-[12px] text-site-dim md:grid" aria-hidden="true">
            <span>Need</span>
            <span className="text-site-paper">ReplyNxt</span>
            <span>{config.comparisonOther}</span>
          </div>
          <dl>
            {config.comparisons.map((item, index) => (
              <div
                key={item.label}
                className={`grid gap-3 px-6 py-6 sm:px-7 md:grid-cols-[0.6fr_1fr_1fr] md:gap-6 ${
                  index > 0 ? "border-t border-white/10" : ""
                }`}
              >
                <dt className="font-semibold">{item.label}</dt>
                <dd className="flex gap-3 text-[15px] leading-7">
                  <Tick />
                  <span>
                    <span className="site-mono mr-2 text-[12px] text-site-dim md:hidden">ReplyNxt</span>
                    {item.replynxt}
                  </span>
                </dd>
                <dd className="flex gap-3 text-[15px] leading-7 text-site-dim">
                  <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-white/30">–</span>
                  <span>
                    <span className="site-mono mr-2 text-[12px] md:hidden">{config.comparisonOther}</span>
                    {item.other}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </GlassCard>
      </section>

      {/* Templates to start from. */}
      <section className={section}>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            label="Start from a template"
            title="Launch in minutes, not a flow-builder afternoon"
            description="Pick a template, connect the Instagram account, choose the post, and the campaign is ready to go live."
          />
          <CtaButton href="/templates" variant="secondary" className="shrink-0 self-start md:self-auto">
            All templates
          </CtaButton>
        </div>
        <Reveal stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.templateLinks.map((template) => (
            <li key={template.href}>
              <Link
                href={template.href}
                className="use-card glass group flex h-full flex-col justify-between gap-6 rounded-[1.75rem] p-6"
              >
                <p className="flex flex-wrap gap-1.5">
                  {template.keywords.map((keyword) => (
                    <mark key={keyword} className="marker text-[13px]">
                      {keyword}
                    </mark>
                  ))}
                </p>
                <span className="flex items-center justify-between gap-4 text-[17px] font-semibold">
                  {template.label}
                  <Chevron className="h-4 w-4 shrink-0 text-site-dim transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </section>

      {/* FAQ, in the home page's style. */}
      <section className={`${section} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
        <SectionHeading label="FAQ" title="Questions teams ask first" />
        <GlassCard className="px-6 py-2">
          {config.faqs.map((faq, index) => (
            <details key={faq.title} className={`group ${index > 0 ? "border-t border-white/10" : ""}`}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {faq.title}
                <svg
                  className="h-5 w-5 shrink-0 text-site-dim transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </summary>
              <p className="max-w-2xl pb-6 text-base leading-7 text-site-dim">
                <WithMarkedKeywords text={faq.body} />
              </p>
            </details>
          ))}
        </GlassCard>
      </section>

      {/* Closing call to action, matching the home page's last section. */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-28 pt-8 text-center sm:px-6">
        <p className="site-mono text-[13px] text-site-paper">Free plan, no card needed</p>
        <SplitHeadline className="mx-auto mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          Turn the next keyword comment into a private reply
        </SplitHeadline>
        <Reveal className="mt-10 flex justify-center">
          <CtaButton href="/login" size="lg">
            Start free
          </CtaButton>
        </Reveal>
      </section>
    </SiteShell>
  );
}
