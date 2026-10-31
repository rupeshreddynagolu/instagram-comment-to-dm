import Link from "next/link";
import CtaButton from "@/components/site/cta-button";
import type { CampaignTemplate } from "@/lib/templates/campaign-templates";

/** "Agents and broker teams" → "agents and broker teams"; "DTC brands" stays. */
export function audienceInSentence(audience: string) {
  return /^[A-Z][a-z]/.test(audience) ? audience[0].toLowerCase() + audience.slice(1) : audience;
}

/** The trigger comment with its keyword marked, as a follower would type it. */
export function MarkedComment({ template }: { template: CampaignTemplate }) {
  const keywords = new Set(template.keywords.map((keyword) => keyword.toUpperCase()));
  return (
    <>
      {template.triggerExample.split(/(\s+)/).map((part, index) =>
        keywords.has(part.toUpperCase()) ? (
          <mark key={index} className="marker text-[11px]">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * The conversation a template creates, in miniature: the follower's comment
 * and the private reply it gets.
 */
export function ConversationPreview({ template }: { template: CampaignTemplate }) {
  return (
    <div aria-hidden="true" className="space-y-2 rounded-2xl border border-white/[0.07] bg-black/25 p-3.5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-site-marker to-[#e1306c] text-[10px] font-semibold text-white">
          F
        </span>
        <p className="rounded-2xl rounded-tl-md bg-white/[0.07] px-3 py-1.5 text-[12px] text-site-paper">
          <MarkedComment template={template} />
        </p>
      </div>
      {/* The clamp sits on an inner span, so a third line can't show through
          the bubble's padding. */}
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-site-reply px-3 py-1.5 text-[12px] leading-[1.4] text-white">
        <span className="line-clamp-2">{template.privateReplyPreview}</span>
      </p>
    </div>
  );
}

function SetupBadge({ minutes }: { minutes: number }) {
  return (
    <p className="site-mono flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-site-paper">
      <svg className="h-3 w-3 text-site-dim" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3l2 1.5" />
      </svg>
      {minutes} min setup
    </p>
  );
}

function Keywords({ template }: { template: CampaignTemplate }) {
  return (
    <p className="flex flex-wrap gap-1.5" aria-label="Keywords">
      {template.keywords.map((keyword) => (
        <mark key={keyword} className="marker text-[12px]">
          {keyword}
        </mark>
      ))}
    </p>
  );
}

/** The title, whose link covers the whole card; the button sits above it. */
function Title({ template, className }: { template: CampaignTemplate; className: string }) {
  return (
    <h2 className={className}>
      <Link
        href={`/templates/${template.slug}`}
        className="after:absolute after:inset-0 after:rounded-[1.75rem] after:content-['']"
      >
        {template.title}
      </Link>
    </h2>
  );
}

function UseButton({ template }: { template: CampaignTemplate }) {
  return (
    <CtaButton href={`/login?template=${template.slug}`} variant="secondary" className="relative z-[1]">
      Use this template
    </CtaButton>
  );
}

function Meta({ template }: { template: CampaignTemplate }) {
  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
      <div className="flex gap-1.5">
        <dt className="text-site-dim">For</dt>
        <dd>{audienceInSentence(template.audience)}</dd>
      </div>
      <div className="flex gap-1.5">
        <dt className="text-site-dim">Goal</dt>
        <dd>{template.goal}</dd>
      </div>
    </dl>
  );
}

const shell = "use-card glass group relative h-full rounded-[1.75rem] p-5 sm:p-6";

/**
 * One template in the library bento. The whole card opens its playbook.
 * - wide: words on the left, the conversation large on the right
 * - tall: the conversation, then what it's best for, filling a double row
 * - regular: compact, the conversation over a short summary
 */
export default function TemplateCard({
  template,
  size = "regular",
}: {
  template: CampaignTemplate;
  size?: "wide" | "tall" | "regular";
}) {
  if (size === "wide") {
    return (
      <article className={`${shell} grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:p-8`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="site-mono text-[12px] text-site-dim">{template.category}</p>
            <SetupBadge minutes={template.setupMinutes} />
          </div>
          <Title template={template} className="mt-4 text-3xl leading-tight sm:text-4xl" />
          <p className="mt-3 max-w-md text-[15px] leading-7 text-site-dim">{template.summary}</p>
          <div className="mt-4">
            <Meta template={template} />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <Keywords template={template} />
            <UseButton template={template} />
          </div>
        </div>
        <div className="lg:scale-105">
          <ConversationPreview template={template} />
        </div>
      </article>
    );
  }

  if (size === "tall") {
    return (
      <article className={`${shell} flex flex-col`}>
        <div className="flex items-center justify-between gap-3">
          <p className="site-mono text-[12px] text-site-dim">{template.category}</p>
          <SetupBadge minutes={template.setupMinutes} />
        </div>
        <div className="mt-4">
          <ConversationPreview template={template} />
        </div>
        <Title template={template} className="mt-5 text-2xl leading-tight" />
        <p className="mt-2 text-[15px] leading-7 text-site-dim">{template.summary}</p>
        <div className="mt-4">
          <Meta template={template} />
        </div>
        <p className="site-mono mt-6 text-[11px] text-site-dim">Best for</p>
        <ul className="mt-2 space-y-1.5">
          {template.bestFor.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[14px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-site-reply" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <Keywords template={template} />
          <UseButton template={template} />
        </div>
      </article>
    );
  }

  return (
    <article className={`${shell} flex flex-col`}>
      <div className="flex items-center justify-between gap-3">
        <p className="site-mono truncate text-[12px] text-site-dim">{template.category}</p>
        <SetupBadge minutes={template.setupMinutes} />
      </div>
      <div className="mt-4">
        <ConversationPreview template={template} />
      </div>
      <Title template={template} className="mt-5 text-xl leading-tight" />
      <p className="mt-2 line-clamp-3 text-[14px] leading-6 text-site-dim">{template.summary}</p>
      <div className="mt-auto pt-5">
        <div className="flex flex-col items-start gap-3 border-t border-white/10 pt-4">
          <Keywords template={template} />
          <UseButton template={template} />
        </div>
      </div>
    </article>
  );
}
