import type { Metadata } from "next";
import Bento from "@/components/home/bento";
import CreatorsMarquee from "@/components/home/creators-marquee";
import DashboardSection from "@/components/home/dashboard-section";
import Hero from "@/components/home/hero";
import PricingPlans from "@/components/home/pricing-plans";
import HowItWorks from "@/components/home/how-it-works";
import SiteShell from "@/components/site-shell";
import CtaButton from "@/components/site/cta-button";
import { GlassCard, SectionHeading } from "@/components/site/primitives";
import Reveal from "@/components/site/reveal";
import SplitHeadline from "@/components/site/split-headline";

export const metadata: Metadata = {
  title: "ReplyNxt - Instagram Comment to DM Campaign OS",
  description:
    "A premium self-serve SaaS for turning Instagram keyword comments into Meta-compliant private replies, lead capture, and campaign growth.",
};

const foundingOffer = [
  "Founding Agency badge on your client reports during beta",
  "Manual onboarding for up to 10 Instagram client accounts",
  "Campaign template setup for your first 3 client campaigns",
  "Direct feedback channel for shaping agency reports and analytics",
];

const referralLoop = [
  "Invite an agency operator",
  "They launch a tracked campaign",
  "Both accounts get future billing credit after paid conversion",
];

const faqs = [
  {
    question: "Does ReplyNxt use the official Meta API?",
    answer:
      "Yes. The product is built around Meta webhooks and Instagram private replies, not scraping, browser automation, or password sharing.",
  },
  {
    question: "What happens when I hit my monthly DM limit?",
    answer:
      "The worker checks workspace plan limits before sending. Over-limit replies are skipped and logged so operators can see what happened.",
  },
  {
    question: "Can users sign up without Instagram first?",
    answer:
      "Yes. Signup uses email magic links. Instagram is connected after the workspace exists, which is cleaner for a B2B SaaS flow.",
  },
  {
    question: "Is ReplyNxt live?",
    answer:
      "Yes. Sign up with your email, connect your Instagram professional account, and launch a campaign today. Paid plans bill in rupees by UPI or card. Replies to every Instagram account, not just accounts added for testing, also depend on Meta App Review approval of ReplyNxt's Instagram permissions.",
  },
];

function Check() {
  return (
    <svg className="mt-1 h-4 w-4 shrink-0 text-site-paper" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.3a1 1 0 0 1-1.42 0L4.78 10.7a1 1 0 1 1 1.42-1.4l2.54 2.56 6.54-6.6a1 1 0 0 1 1.42.04Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <SiteShell active="home" flushTop>
      <Hero />
      <HowItWorks />
      <DashboardSection />
      <CreatorsMarquee />
      <Bento />

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 py-20 sm:py-32">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SectionHeading
            label="Pricing"
            title="Free to test, simple to scale"
            description="Each plan maps directly to campaign count and monthly DM volume. Pay monthly, or yearly for 20% less, by UPI or card; your workspace plan updates as soon as the payment clears."
          />
          <PricingPlans />
        </div>
      </section>

      {/* Founding agency offer */}
      <section id="founding-offer" className="scroll-mt-24 py-20 sm:py-32">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              label="Founding agency offer"
              title="Bring your first clients before the market gets noisy"
              description="Early agencies get hands-on onboarding, template help, and a say in the agency reporting roadmap. The offer is designed for teams already managing Instagram campaigns for multiple clients."
            />
            <CtaButton href="/login" className="mt-8">
              Claim founding access
            </CtaButton>
          </div>

          <Reveal stagger className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold">What founders get</h3>
              <ul className="mt-5 space-y-3">
                {foundingOffer.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-6">
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold">Referral loop</h3>
              <p className="mt-3 text-[15px] leading-6 text-site-dim">
                Referrals start as a manual founding-agency loop first, then
                move into billing credits once abuse controls are proven.
              </p>
              <ol className="mt-5 space-y-3">
                {referralLoop.map((item, index) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-6">
                    <span
                      aria-hidden="true"
                      className="site-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs"
                    >
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-32 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading label="FAQ" title="Questions before you launch" />
        <GlassCard className="px-6 py-2">
          {faqs.map((faq, index) => (
            <details key={faq.question} className={`group ${index > 0 ? "border-t border-white/10" : ""}`}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <svg
                  className="h-5 w-5 shrink-0 text-site-dim transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </summary>
              <p className="max-w-2xl pb-6 text-base leading-7 text-site-dim">{faq.answer}</p>
            </details>
          ))}
        </GlassCard>
      </section>

      {/* Closing call to action */}
      <section className="flex min-h-[70dvh] items-center">
        <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-32">
          <p className="site-mono text-[13px] text-site-paper">Ready when your next reel goes live</p>
          <SplitHeadline className="mx-auto mt-5 text-5xl leading-[1] sm:text-6xl lg:text-7xl">
            Start free and turn keyword comments into private replies
          </SplitHeadline>
          <Reveal className="mt-12 flex justify-center">
            <CtaButton href="/login" size="lg">
              Start free
            </CtaButton>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
