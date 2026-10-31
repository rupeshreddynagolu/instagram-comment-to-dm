import CountUp from "@/components/site/count-up";
import { Avatar } from "@/components/site/phone-mockup";
import { GlassCard, SectionHeading } from "@/components/site/primitives";
import Reveal from "@/components/site/reveal";
import { Parallax } from "@/components/site/scenes";

const features = [
  "Email magic-link signup",
  "Workspace-based tenancy",
  "Agency multi-account support",
  "Plan limits checked on every send",
];

const recent = [
  { avatar: "avatar-1", user: "@ananya.k", campaign: "Product guide reply", status: "Sent" },
  { avatar: "avatar-4", user: "@kabir.builds", campaign: "Price request", status: "Sent" },
  { avatar: "avatar-5", user: "@meera.shop", campaign: "Lead magnet", status: "Queued" },
  { avatar: "avatar-2", user: "@rohan.fits", campaign: "Fitness plan", status: "Sent" },
];

function Check() {
  return (
    <svg className="mt-1 h-4 w-4 shrink-0 text-site-paper" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.3a1 1 0 0 1-1.42 0L4.78 10.7a1 1 0 1 1 1.42-1.4l2.54 2.56 6.54-6.6a1 1 0 0 1 1.42.04Z" clipRule="evenodd" />
    </svg>
  );
}

/** Scene four: the operator dashboard rising into view, numbers counting up. */
export default function DashboardSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Parallax>
          <GlassCard className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="site-mono text-[13px] text-site-dim">Dashboard</p>
              <p className="site-mono flex items-center gap-2 text-[13px] text-site-paper">
                <span className="h-2 w-2 rounded-full bg-site-reply" aria-hidden="true" />
                Worker running
              </p>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-4 border-b border-white/10 pb-6">
              <div>
                <dt className="text-xs text-site-dim sm:text-sm">Active campaigns</dt>
                <dd className="display mt-1 text-4xl sm:text-5xl"><CountUp value={7} /></dd>
              </div>
              <div>
                <dt className="text-xs text-site-dim sm:text-sm">DMs this month</dt>
                <dd className="display mt-1 text-4xl sm:text-5xl"><CountUp value={1284} /></dd>
              </div>
              <div>
                <dt className="text-xs text-site-dim sm:text-sm">Delivered</dt>
                <dd className="display mt-1 text-4xl sm:text-5xl"><CountUp value={97.6} decimals={1} suffix="%" /></dd>
              </div>
            </dl>
            <p className="mt-5 text-sm font-semibold">Recent replies</p>
            <ul className="mt-2 divide-y divide-white/10">
              {recent.map((row) => (
                <li key={row.user} className="flex items-center gap-3 py-3 text-sm">
                  <Avatar name={row.avatar} className="h-8 w-8" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{row.user}</span>
                    <span className="block truncate text-site-dim">{row.campaign}</span>
                  </span>
                  <span
                    className={`site-mono rounded-full px-2.5 py-1 text-[12px] ${
                      row.status === "Sent" ? "bg-site-reply/20" : "bg-white/5 text-site-dim"
                    }`}
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </Parallax>

        <div>
          <SectionHeading
            label="Operator dashboard"
            title="Built to show what happened, not hide it"
            description="Every comment event becomes traceable: queued, matched, sent, skipped, failed, rate-limited, or blocked by plan limits."
          />
          <Reveal as="ul" stagger className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2.5 text-[15px]">
                <Check />
                {feature}
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
