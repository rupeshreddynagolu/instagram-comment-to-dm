import type { Metadata } from "next";
import SiteShell from "@/components/site-shell";
import CtaButton from "@/components/site/cta-button";
import TemplateCard from "@/components/templates/template-card";
import TemplateDeck from "@/components/templates/template-deck";
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

export default function TemplatesPage() {
  // Three different kinds of campaign for the deck in the hero.
  const deck = ["event-rsvp", "fitness-plan", "dtc-product-link"]
    .map((slug) => CAMPAIGN_TEMPLATES.find((template) => template.slug === slug))
    .filter((template) => template !== undefined);

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
          <TemplateDeck templates={deck} />
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
              <TemplateCard template={template} />
            </li>
          ))}
        </Reveal>
      </section>
    </SiteShell>
  );
}
