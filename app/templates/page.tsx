import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site-shell";
import CtaButton from "@/components/site/cta-button";
import TemplateVisual from "@/components/template-visual";
import { SectionHeading } from "@/components/site/primitives";
import Reveal from "@/components/site/reveal";
import SplitHeadline from "@/components/site/split-headline";
import { CAMPAIGN_TEMPLATES } from "@/lib/templates/campaign-templates";

export const metadata: Metadata = {
  title: "Instagram Comment to DM Templates - ReplyNxt",
  description:
    "Copy ready-to-launch Instagram comment-to-DM campaign templates for product links, lead magnets, real estate, fitness, restaurants, events, and creators.",
  keywords: [
    "Instagram comment to DM templates",
    "comment to DM campaigns",
    "Instagram DM automation templates",
    "Manychat alternative templates",
  ],
};

/** "Agents and broker teams" → "agents and broker teams"; "DTC brands" stays. */
function audienceInSentence(audience: string) {
  return /^[A-Z][a-z]/.test(audience)
    ? audience[0].toLowerCase() + audience.slice(1)
    : audience;
}

export default function TemplatesPage() {
  const [featured] = CAMPAIGN_TEMPLATES;

  return (
    <SiteShell active="templates">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal onLoadDelay={0}>
            <p className="site-mono text-[13px] text-site-paper">Template library</p>
          </Reveal>
          <SplitHeadline
            as="h1"
            onLoad
            className="mt-4 text-[clamp(2.75rem,5.5vw,4.75rem)] leading-[1]"
          >
            Instagram campaigns you can copy in minutes
          </SplitHeadline>
          <Reveal onLoadDelay={0.4}>
            <p className="mt-6 max-w-xl text-lg leading-8 text-site-paper/85">
              Ready-made comment-to-DM campaigns for lead magnets, product links, events,
              service menus and client work, each with its keywords and reply written for you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href="/login" size="lg">
                Start free
              </CtaButton>
              <CtaButton href="#template-grid" size="lg" variant="secondary">
                Browse templates
              </CtaButton>
            </div>
          </Reveal>
        </div>
        <Reveal onLoadDelay={0.55}>
          <TemplateVisual template={featured} />
        </Reveal>
      </section>

      <section id="template-grid" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          label={`${CAMPAIGN_TEMPLATES.length} templates`}
          title="Pick the one closest to your campaign"
        />
        <Reveal stagger as="ul" className="mt-12 grid gap-4 md:grid-cols-2">
          {CAMPAIGN_TEMPLATES.map((template) => (
            <li key={template.slug}>
              <article className="use-card glass group relative flex h-full flex-col rounded-[1.75rem] p-6 sm:p-7">
                <p className="site-mono text-[12px] text-site-dim">
                  {template.category}, for {audienceInSentence(template.audience)}
                </p>
                <h2 className="mt-3 text-2xl leading-tight">
                  {/* The title's link covers the card; the button sits above it. */}
                  <Link
                    href={`/templates/${template.slug}`}
                    className="after:absolute after:inset-0 after:rounded-[1.75rem] after:content-['']"
                  >
                    {template.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-md text-[15px] leading-7 text-site-dim">{template.summary}</p>
                <p className="mt-5 flex flex-wrap gap-1.5" aria-label="Keywords">
                  {template.keywords.map((keyword) => (
                    <mark key={keyword} className="marker text-[13px]">
                      {keyword}
                    </mark>
                  ))}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
                  <span className="site-mono flex items-center gap-1 text-[12px] text-site-paper">
                    View playbook
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 3.5 10.5 8 6 12.5" />
                    </svg>
                  </span>
                  <CtaButton
                    href={`/login?template=${template.slug}`}
                    variant="secondary"
                    className="relative z-[1]"
                  >
                    Use this template
                  </CtaButton>
                </div>
              </article>
            </li>
          ))}
        </Reveal>
      </section>
    </SiteShell>
  );
}
