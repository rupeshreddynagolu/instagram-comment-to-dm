import { Photo } from "@/components/site/media";
import { GlassCard } from "@/components/site/primitives";
import { HorizontalScroll } from "@/components/site/scenes";
import SplitHeadline from "@/components/site/split-headline";

const flowSteps = [
  {
    eyebrow: "Connect",
    title: "Link your Instagram professional account",
    description:
      "Owners sign in by email, connect Instagram once, and manage the account as a workspace integration.",
  },
  {
    eyebrow: "Build",
    title: "Choose a post, keywords, and the exact DM",
    description:
      "Create campaigns for reels, posts, launches, product drops, lead magnets, and client work.",
  },
  {
    eyebrow: "Deliver",
    title: "Send comment-based private replies safely",
    description:
      "Meta webhooks are deduped, queued, checked against limits, and sent through the private reply flow.",
  },
];

function Check() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.3a1 1 0 0 1-1.42 0L4.78 10.7a1 1 0 1 1 1.42-1.4l2.54 2.56 6.54-6.6a1 1 0 0 1 1.42.04Z" clipRule="evenodd" />
    </svg>
  );
}

/**
 * Each visual is a small screen from the app: a title bar naming where in the
 * app it is, then the rows that screen shows. Blue marks what ReplyNxt sends
 * or has done; orange marks keywords, as everywhere else on the page.
 */
function Screen({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050b0e]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </span>
        <p className="site-mono ml-2 text-[12px] text-site-dim">{title}</p>
        {meta && <p className="site-mono ml-auto text-[12px] text-site-dim">{meta}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** A profile picture: an initial inside the story ring the hero phone uses. */
function Ring({ handle, className = "h-10 w-10" }: { handle: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`block shrink-0 rounded-full bg-gradient-to-tr from-[#f9a825] via-site-marker to-[#e1306c] p-[1.5px] ${className}`}>
      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#5c2a12] text-[13px] font-semibold uppercase text-white ring-2 ring-[#050b0e]">
        {handle[0]}
      </span>
    </span>
  );
}

function StatusDot({ label }: { label: string }) {
  return (
    <span className="site-mono inline-flex items-center gap-1.5 text-[12px] text-site-paper">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-site-reply" />
      {label}
    </span>
  );
}

function ConnectVisual() {
  const checks = [
    ["Comments webhook", "Subscribed"],
    ["Access token", "Encrypted"],
    ["Token refresh", "Daily"],
  ];
  return (
    <Screen title="Settings › Instagram">
      <div className="flex items-center gap-3">
        <Ring handle="kesari.skin" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold">kesari.skin</p>
          <p className="text-[13px] text-site-dim">Professional account</p>
        </div>
        <span className="ml-auto">
          <StatusDot label="Connected" />
        </span>
      </div>
      <ul className="mt-4 divide-y divide-white/10 border-t border-white/10">
        {checks.map(([label, value]) => (
          <li key={label} className="flex items-center gap-2.5 py-2.5 text-[14px]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-site-reply/15 text-site-reply">
              <Check />
            </span>
            {label}
            <span className="site-mono ml-auto text-[12px] text-site-dim">{value}</span>
          </li>
        ))}
      </ul>
    </Screen>
  );
}

function BuildVisual() {
  return (
    <Screen title="Campaigns › New" meta="Draft">
      <div className="flex items-center gap-3">
        <span className="block h-12 w-10 shrink-0 overflow-hidden rounded-md">
          <Photo name="feed-store" alt="" className="h-full w-full bg-gradient-to-br from-[#5c2a12] to-site-marker" />
        </span>
        <div className="min-w-0">
          <p className="site-mono text-[11px] text-site-dim">Post</p>
          <p className="truncate text-[14px] font-medium">Saffron Glow serum is back in stock</p>
        </div>
      </div>

      <p className="site-mono mt-4 text-[11px] text-site-dim">Keywords</p>
      <p className="mt-1.5 flex flex-wrap gap-1.5">
        {["PRICE", "LINK", "BUY"].map((keyword) => (
          <mark key={keyword} className="marker rounded-sm text-[13px] font-semibold">
            {keyword}
          </mark>
        ))}
      </p>

      <p className="site-mono mt-4 text-[11px] text-site-dim">Private reply</p>
      <div className="mt-1.5 space-y-1.5">
        <p className="w-fit max-w-[90%] rounded-[1.1rem] rounded-bl-md bg-[#262626] px-3 py-2 text-[13px] leading-5">
          Hi {"{name}"}! It&apos;s ₹849 today, free shipping.
        </p>
        <p className="w-fit rounded-[1.1rem] bg-[#262626] px-4 py-1.5 text-[13px] font-semibold text-site-reply">
          Buy now
        </p>
      </div>
    </Screen>
  );
}

function DeliverVisual() {
  const rows = [
    ["09:41:02", "Comment received", "ananya.k · PRICE"],
    ["09:41:02", "Duplicate check", "First time"],
    ["09:41:03", "Plan limit", "1,284 of 2,000"],
    ["09:41:04", "Private reply sent", "Delivered"],
  ];
  return (
    <Screen title="Delivery log" meta="Live">
      <ol className="relative">
        {rows.map(([time, step, detail], index) => {
          const last = index === rows.length - 1;
          return (
            <li key={step} className="relative flex gap-3 pb-3.5 last:pb-0">
              {/* The line joining each step to the next. */}
              {!last && <span aria-hidden="true" className="absolute left-[5px] top-4 h-full w-px bg-white/10" />}
              <span
                aria-hidden="true"
                className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${
                  last ? "border-site-reply bg-site-reply" : "border-white/25 bg-[#050b0e]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-[14px] font-medium ${last ? "text-site-paper" : ""}`}>{step}</p>
                <p className="text-[13px] text-site-dim">{detail}</p>
              </div>
              <span className="site-mono pt-0.5 text-[11px] text-site-dim">{time}</span>
            </li>
          );
        })}
      </ol>
    </Screen>
  );
}

const visuals = [ConnectVisual, BuildVisual, DeliverVisual];

/** Scene three: the workflow as panels that pan sideways while pinned. */
export default function HowItWorks() {
  return (
    <HorizontalScroll>
      <section id="product" className="flex min-h-[100dvh] flex-col justify-center overflow-hidden py-16 md:pb-8 md:pt-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          {/* Heading and summary side by side on wide screens, so the pinned
              section fits a short laptop screen with a whole card in view. */}
          <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
            <div>
              <p className="site-mono text-[13px] text-site-dim">Product workflow</p>
              <SplitHeadline className="mt-3 max-w-2xl text-4xl leading-[1.05] sm:text-5xl">
                A cleaner way to run Instagram DM campaigns
              </SplitHeadline>
            </div>
            <p className="mt-5 max-w-xl text-base leading-7 text-site-dim lg:mt-0">
              The app separates business signup from Instagram connection, then
              gives each workspace real usage, billing, delivery, and log state.
            </p>
          </div>
        </div>

        <ol
          data-track
          className="mt-10 flex flex-col gap-6 px-4 sm:px-6 md:mt-8 md:w-max md:flex-row md:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] md:pr-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
        >
          {flowSteps.map((step, index) => {
            const Visual = visuals[index];
            return (
              <li key={step.title} className="md:w-[min(calc(100vw-3rem),69rem)]">
                <GlassCard className="grid h-full gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1.1fr] md:items-center lg:gap-12 lg:p-10">
                  <div>
                    <p className="site-mono flex items-center gap-3 text-[13px] text-site-dim">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-site-paper">
                        {index + 1}
                      </span>
                      {step.eyebrow}
                    </p>
                    <h3 className="display mt-5 text-3xl leading-tight sm:text-4xl">{step.title}</h3>
                    <p className="mt-4 max-w-md text-base leading-7 text-site-dim">{step.description}</p>
                  </div>
                  <Visual />
                </GlassCard>
              </li>
            );
          })}
        </ol>
      </section>
    </HorizontalScroll>
  );
}
