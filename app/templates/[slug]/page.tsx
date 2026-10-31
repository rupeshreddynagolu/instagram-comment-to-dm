import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/site-shell";
import CtaButton from "@/components/site/cta-button";
import TemplateVisual from "@/components/template-visual";
import { GlassCard, SectionHeading } from "@/components/site/primitives";
import Reveal from "@/components/site/reveal";
import SplitHeadline from "@/components/site/split-headline";
import {
  CAMPAIGN_TEMPLATES,
  getCampaignTemplate,
  getCampaignTemplateSlugs,
} from "@/lib/templates/campaign-templates";

type TemplatePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCampaignTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getCampaignTemplate(slug);

  if (!template) {
    return {
      title: "Template Not Found - ReplyNxt",
    };
  }

  return {
    title: `${template.title} - Instagram Comment to DM Template`,
    description: template.summary,
    keywords: [
      `${template.title} template`,
      "Instagram comment to DM template",
      "Instagram DM campaign template",
      template.category,
      template.audience,
    ],
  };
}

export default async function TemplateDetailPage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getCampaignTemplate(slug);

  if (!template) {
    notFound();
  }

  const relatedTemplates = CAMPAIGN_TEMPLATES.filter(
    (item) => item.slug !== template.slug
  ).slice(0, 3);

  return (
    <SiteShell active="templates">
      <section className="mx-auto grid w-full max-w-6xl items-start gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Link
            href="/templates"
            className="site-mono inline-flex min-h-11 items-center gap-1.5 text-[13px] text-site-dim transition-colors hover:text-site-paper"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 3.5 5.5 8l4.5 4.5" />
            </svg>
            All templates
          </Link>
          <Reveal onLoadDelay={0}>
            <p className="site-mono mt-6 text-[13px] text-site-paper">{template.category} template</p>
          </Reveal>
          <SplitHeadline as="h1" onLoad className="mt-3 text-[clamp(2.75rem,5.5vw,4.75rem)] leading-[1]">
            {template.title}
          </SplitHeadline>
          <Reveal onLoadDelay={0.4}>
            <p className="mt-6 max-w-xl text-lg leading-8 text-site-paper/85">{template.summary}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton href={`/login?template=${template.slug}`} size="lg">
                Use this template
              </CtaButton>
              <CtaButton href="#playbook" size="lg" variant="secondary">
                Read the playbook
              </CtaButton>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <div className="flex flex-col-reverse gap-1">
                <dt className="site-mono text-[12px] text-site-dim">Audience</dt>
                <dd className="font-semibold">{template.audience}</dd>
              </div>
              <div className="flex flex-col-reverse gap-1">
                <dt className="site-mono text-[12px] text-site-dim">Setup time</dt>
                <dd className="font-semibold">{template.setupMinutes} minutes</dd>
              </div>
              <div className="flex flex-col-reverse gap-1">
                <dt className="site-mono text-[12px] text-site-dim">Campaign goal</dt>
                <dd className="font-semibold">{template.goal}</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal onLoadDelay={0.55}>
          <TemplateVisual template={template} />
        </Reveal>
      </section>

      <section id="playbook" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading label="Campaign outcome" title="What this campaign gets you" description={template.outcome} />
          <GlassCard className="p-6 sm:p-8">
            <p className="site-mono text-[13px] text-site-dim">Setup playbook</p>
            <ol className="mt-5 space-y-5">
              {template.playbook.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="site-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[13px]"
                  >
                    {index + 1}
                  </span>
                  <span className="pt-1 text-base leading-7">{step}</span>
                </li>
              ))}
            </ol>
          </GlassCard>
        </div>

        <Reveal stagger className="mt-4 grid gap-4 md:grid-cols-2">
          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-2xl">Best for</h2>
            <ul className="mt-4 space-y-3">
              {template.bestFor.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-7 text-site-paper/90">
                  <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-site-reply" />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-2xl">Metrics to watch</h2>
            <ul className="mt-4 space-y-3">
              {template.metrics.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-7 text-site-paper/90">
                  <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-site-marker" />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <GlassCard glow="orange" className="flex flex-col gap-6 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl leading-tight sm:text-4xl">Copy this campaign into ReplyNxt</h2>
            <p className="mt-2 max-w-xl text-base leading-7 text-site-dim">
              Sign in, connect Instagram, pick a post or reel, and the template copy is ready in
              your campaign draft.
            </p>
          </div>
          <CtaButton href={`/login?template=${template.slug}`} size="lg" className="shrink-0 self-start lg:self-auto">
            Use this template
          </CtaButton>
        </GlassCard>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-16 sm:px-6">
        <SectionHeading label="Keep browsing" title="More templates" />
        <Reveal stagger as="ul" className="mt-10 grid gap-4 md:grid-cols-3">
          {relatedTemplates.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/templates/${item.slug}`}
                className="use-card glass group flex h-full flex-col gap-4 rounded-[1.75rem] p-6"
              >
                <p className="site-mono text-[12px] text-site-dim">{item.category}</p>
                <span className="text-xl font-semibold leading-tight">{item.title}</span>
                <p className="text-[15px] leading-6 text-site-dim">{item.summary}</p>
                <p className="mt-auto flex flex-wrap gap-1.5">
                  {item.keywords.map((keyword) => (
                    <mark key={keyword} className="marker text-[12px]">
                      {keyword}
                    </mark>
                  ))}
                </p>
              </Link>
            </li>
          ))}
        </Reveal>
      </section>
    </SiteShell>
  );
}
