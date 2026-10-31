"use client";

import { useRef, useState } from "react";
import type { BillingInterval, PaidPlan } from "@/lib/billing/plans";
import {
  formatInr,
  monthlyEquivalentInr,
  PLAN_PRICES_INR,
  YEARLY_DISCOUNT_PERCENT,
} from "@/lib/billing/pricing";
import { contactMailto } from "@/lib/contact";
import CtaButton from "@/components/site/cta-button";
import { GlassCard } from "@/components/site/primitives";
import Reveal from "@/components/site/reveal";

interface Tier {
  name: string;
  /** Null for the free plan. */
  plan: PaidPlan | null;
  label: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    plan: null,
    label: "Start testing",
    description: "For validating one keyword campaign.",
    features: ["1 campaign", "100 DMs per month", "Email sign-in", "Basic DM logs"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    plan: "PRO",
    label: "Most popular",
    description: "For brands and creators running repeatable launches.",
    features: ["10 campaigns", "2,000 DMs per month", "Pay by UPI or card", "Daily token maintenance"],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Agency",
    plan: "AGENCY",
    label: "Higher volume",
    description: "For operators managing bigger campaign pipelines.",
    features: [
      "Unlimited campaigns",
      "10 Instagram accounts",
      "10,000 DMs per month",
      "Queue-backed worker",
      "Member roles and reports",
    ],
    cta: "Start Agency",
    featured: false,
  },
];

const customFeatures = [
  "More DMs and accounts than Agency",
  "Extra team seats",
  "Invoice billing",
  "Hands-on onboarding",
  "Priority support",
];

const customMailto = contactMailto(
  "ReplyNxt Custom plan",
  [
    "Hi ReplyNxt team,",
    "",
    "We'd like a Custom plan.",
    "",
    "Company:",
    "Instagram accounts:",
    "DMs per month (roughly):",
    "Team members:",
    "",
    "Anything else:",
  ].join("\n")
);

/** The plan for teams that outgrow Agency: no fixed price, a conversation instead. */
function CustomPlan() {
  return (
    <GlassCard
      as="article"
      className="mt-4 grid gap-6 p-7 md:grid-cols-[1fr_auto] md:items-center md:gap-10"
    >
      <div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="text-2xl font-semibold">Custom</h3>
          <span className="site-mono text-[13px] text-site-dim">For bigger teams</span>
        </div>
        <p className="mt-2 max-w-xl text-[15px] text-site-dim">
          Need more than Agency? We&apos;ll shape the limits, seats and billing around how
          your team runs campaigns.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {customFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[13px]"
            >
              <Check />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 md:items-end md:text-right">
        <p className="display text-4xl">Let&apos;s talk</p>
        <p className="site-mono text-[12px] text-site-dim">Priced for your volume</p>
        <CtaButton href={customMailto} variant="secondary" className="mt-1 flex w-full md:w-auto">
          Contact us
        </CtaButton>
      </div>
    </GlassCard>
  );
}

const intervals: { value: BillingInterval; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
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

/**
 * The Monthly / Yearly switch: a two-option radio group drawn as one track
 * with a sliding thumb. Arrow keys move between the options.
 */
function IntervalSwitch({
  value,
  onChange,
}: {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const yearly = value === "YEARLY";

  function onKeyDown(event: React.KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next = yearly ? "MONTHLY" : "YEARLY";
    onChange(next);
    buttons.current[next === "YEARLY" ? 1 : 0]?.focus();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Billing period"
        className="relative grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1"
      >
        {/* The thumb slides under whichever option is chosen. */}
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-site-paper shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            yearly ? "translate-x-full" : ""
          }`}
        />
        {intervals.map((option, index) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={onKeyDown}
              className={`relative z-[1] min-h-11 min-w-[6.5rem] rounded-full px-5 text-[15px] font-semibold transition-colors duration-300 md:min-h-10 ${
                checked ? "text-site-ink" : "text-site-dim hover:text-site-paper"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1 ring-inset transition-colors duration-300 ${
          yearly
            ? "bg-site-reply/15 text-[#5cc4f5] ring-site-reply/35"
            : "text-site-dim ring-white/10"
        }`}
      >
        Save {YEARLY_DISCOUNT_PERCENT}% yearly
      </span>
    </div>
  );
}

function Price({ plan, interval }: { plan: PaidPlan | null; interval: BillingInterval }) {
  if (!plan) {
    return (
      <div className="mt-7">
        <p className="flex items-baseline gap-1">
          <span className="display text-6xl">₹0</span>
          <span className="text-site-dim">/month</span>
        </p>
        <p className="site-mono mt-2 h-5 text-[12px] text-site-dim">Free forever</p>
      </div>
    );
  }

  const monthly = PLAN_PRICES_INR[plan].MONTHLY;
  const yearly = interval === "YEARLY";
  const shown = yearly ? monthlyEquivalentInr(plan) : monthly;

  return (
    <div className="mt-7">
      <p className="flex items-baseline gap-2">
        {/* The key replays the small fade when the figure changes. */}
        <span key={`${plan}-${interval}`} className="price-swap display text-6xl">
          {formatInr(shown)}
        </span>
        <span className="text-site-dim">/month</span>
        {yearly && (
          <s className="text-[15px] text-site-dim" aria-label={`was ${formatInr(monthly)} a month`}>
            {formatInr(monthly)}
          </s>
        )}
      </p>
      <p className="site-mono mt-2 h-5 text-[12px] text-site-dim">
        {yearly ? `${formatInr(PLAN_PRICES_INR[plan].YEARLY)} billed once a year` : "Billed monthly, cancel anytime"}
      </p>
    </div>
  );
}

/** The plans with a Monthly / Yearly switch; paid plans check out at that period. */
export default function PricingPlans() {
  const [interval, setBillingInterval] = useState<BillingInterval>("MONTHLY");

  return (
    <>
      <div className="mt-10">
        <IntervalSwitch value={interval} onChange={setBillingInterval} />
      </div>
      <Reveal stagger className="mt-8 grid gap-4 lg:grid-cols-3">
        {tiers.map((tier) => (
          <GlassCard
            key={tier.name}
            as="article"
            glow={tier.featured ? "orange" : undefined}
            className="flex flex-col p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold">{tier.name}</h3>
              {tier.featured ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-site-marker/15 px-3 py-1 text-[13px] font-medium text-[#ff9f80] ring-1 ring-inset ring-site-marker/35">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-site-marker" />
                  {tier.label}
                </span>
              ) : (
                <span className="site-mono text-[13px] text-site-dim">{tier.label}</span>
              )}
            </div>
            <p className="mt-2 text-[15px] text-site-dim">{tier.description}</p>
            <Price plan={tier.plan} interval={interval} />
            <ul className="mt-7 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-[15px]">
                  <Check />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <CtaButton
                href={
                  tier.plan
                    ? `/settings?plan=${tier.plan}&billing=${interval.toLowerCase()}`
                    : "/login"
                }
                variant={tier.featured ? "primary" : "secondary"}
                className="flex w-full"
              >
                {tier.cta}
              </CtaButton>
            </div>
          </GlassCard>
        ))}
      </Reveal>
      <CustomPlan />
    </>
  );
}
