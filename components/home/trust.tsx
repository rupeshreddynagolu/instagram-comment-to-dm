import CountUp from "@/components/site/count-up";
import InView from "@/components/site/in-view";
import Reveal from "@/components/site/reveal";
import ScrambleText from "@/components/site/scramble-text";

function Tick({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.3a1 1 0 0 1-1.42 0L4.78 10.7a1 1 0 1 1 1.42-1.4l2.54 2.56 6.54-6.6a1 1 0 0 1 1.42.04Z" clipRule="evenodd" />
    </svg>
  );
}

function Title({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{children}</h3>
      <p className="mt-1 text-[15px] leading-6 text-site-dim">{text}</p>
    </div>
  );
}

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as React.CSSProperties;

// Same card as the use cases. Each plays its small sequence once as it comes
// into view (`seq` steps, timed by --d); hover only adds a lift and a brighter
// edge, never a change of state.
const card = "use-card glass group relative flex flex-col gap-6 overflow-hidden rounded-[1.75rem] p-6";

/* Tokens: the stored value resolves into ciphertext, under a closed lock. */
function Tokens() {
  return (
    <InView as="article" className={`${card} justify-between md:col-span-2`}>
      <div className="flex items-center justify-between">
        <svg className="h-11 w-11 text-site-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
          <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
        <span className="site-mono rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-site-paper">AES-256-GCM</span>
      </div>
      <div className="site-mono space-y-1 rounded-xl bg-black/30 p-3 text-[11px] leading-5 text-site-dim">
        <p className="truncate">
          <ScrambleText text="9f3a·c21e·07b4·e88d·51aa·3d0c" />
        </p>
        <p className="truncate">
          <ScrambleText text="b6d2·4e19·aa70·1fc3·9e05·77b1" />
        </p>
      </div>
      <Title text="Stored with AES-256-GCM and refreshed before they expire.">Encrypted Instagram tokens</Title>
    </InView>
  );
}

/* Plan limits: the bar fills to this month's usage; both outcomes shown. */
function PlanLimits() {
  return (
    <InView as="article" className={`${card} md:col-span-4`}>
      <Title text="Over-limit replies are skipped and logged, never sent.">Plan limits checked on every send</Title>
      <div>
        <div className="site-mono flex justify-between text-[13px]">
          <span>
            <CountUp value={1284} /> DMs this month
          </span>
          <span className="text-site-dim">of 2,000</span>
        </div>
        <div className="relative mt-2 h-2 rounded-full bg-white/10">
          <div className="fill-bar h-full w-[64%] origin-left rounded-full bg-gradient-to-r from-site-reply to-site-marker" />
          {/* The plan's ceiling. */}
          <span aria-hidden="true" className="absolute -top-1 right-0 h-4 w-px bg-site-marker" />
        </div>
        <p className="seq site-mono mt-2 text-right text-[11px] text-site-dim" style={delay(1.2)}>
          716 left this month
        </p>
      </div>
      <ul className="site-mono space-y-1.5 text-[12px]">
        <li className="seq flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2" style={delay(0.5)}>
          <span className="text-site-paper">rohan.fits</span>
          <span className="text-site-dim">PRICE</span>
          <span className="ml-auto flex items-center gap-1 text-site-reply">
            <Tick /> Within limit, sent
          </span>
        </li>
        <li className="seq flex items-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-2" style={delay(0.8)}>
          <span className="text-site-paper">Plan used up</span>
          <span className="ml-auto text-site-marker">Skipped and logged</span>
        </li>
      </ul>
    </InView>
  );
}

/* The worker: the three steps light up in order, ending on "Sent". */
function QueueWorker() {
  const steps = [
    ["Received", "comment 1802…"],
    ["Deduped", "first time"],
    ["Sent", "@ananya.k"],
  ];
  return (
    <InView as="article" className={`${card} md:col-span-3`}>
      <Title text="Each comment is stored, checked once, and sent by a background worker.">Queue-backed delivery worker</Title>
      <ol className="relative">
        <span aria-hidden="true" className="absolute bottom-5 left-[9px] top-5 w-px bg-white/10" />
        {steps.map(([state, detail], index) => (
          <li key={state} className="site-mono relative flex items-center gap-3 py-2 pl-8 text-[13px]">
            {/* Each step's dot turns into a tick, one after another. */}
            <span
              aria-hidden="true"
              className="step-dot absolute left-0 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-white/20 bg-[#071015] text-site-ink"
              style={delay(0.3 + index * 0.5)}
            >
              <Tick className="h-2.5 w-2.5" />
            </span>
            <span>{state}</span>
            <span className="ml-auto text-site-dim">{detail}</span>
          </li>
        ))}
      </ol>
    </InView>
  );
}

/* Payment: the status goes from processing to active, once. */
function Payments() {
  return (
    <InView as="article" className={`${card} justify-between md:col-span-3`}>
      <Title text="Your workspace plan updates as soon as the payment clears.">Pay by UPI or card</Title>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="display text-5xl">₹1,599</p>
          <p className="site-mono mt-1 text-[12px] text-site-dim">Pro, per month</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="site-mono flex rounded-full border border-white/10 p-0.5 text-[11px]">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-site-paper">UPI</span>
            <span className="px-2.5 py-1 text-site-dim">Card</span>
          </p>
          <p className="site-mono relative h-5 text-[12px]">
            <span className="pay-processing absolute right-0 flex items-center gap-1.5 whitespace-nowrap text-site-dim" aria-hidden="true">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-site-paper motion-reduce:animate-none" />
              Payment clearing
            </span>
            <span className="pay-active flex items-center gap-1.5 whitespace-nowrap text-site-paper">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-site-reply text-site-ink">
                <Tick className="h-2.5 w-2.5" />
              </span>
              Pro is active
            </span>
          </p>
        </div>
      </div>
    </InView>
  );
}

const underneath = [
  ["Workspace-based tenancy", "M3.5 20.5h17M5 20.5V8l7-4.5L19 8v12.5M9.5 20.5v-5h5v5"],
  ["Webhook event storage", "M4 6.5c0-1.4 3.6-2.5 8-2.5s8 1.1 8 2.5-3.6 2.5-8 2.5-8-1.1-8-2.5Zm0 0v11c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-11M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"],
  ["DM logs and statuses", "M5 6.5h14M5 12h14M5 17.5h9"],
  ["Token refresh maintenance", "M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"],
  ["Email magic-link signup", "M3.5 6.5h17v11h-17v-11Zm0 0 8.5 6.5 8.5-6.5"],
];

/* Everything else, as chips that arrive one after another. */
function Underneath() {
  return (
    <InView as="article" className={`${card} md:col-span-6 md:flex-row md:items-center md:justify-between`}>
      <h3 className="shrink-0 text-lg font-semibold">And underneath</h3>
      <ul className="flex flex-wrap gap-2 md:justify-end">
        {underneath.map(([label, path], index) => (
          <li
            key={label}
            className="seq site-mono flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[13px] text-site-paper"
            style={delay(0.1 + index * 0.08)}
          >
            <svg className="h-3.5 w-3.5 text-site-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={path} />
            </svg>
            {label}
          </li>
        ))}
      </ul>
    </InView>
  );
}

/** Trust and compliance as a bento of cards, each showing the safeguard at work. */
export default function Trust() {
  return (
    <Reveal stagger className="mt-12 grid gap-4 md:grid-cols-6">
      <Tokens />
      <PlanLimits />
      <QueueWorker />
      <Payments />
      <Underneath />
    </Reveal>
  );
}
