import CountUp from "@/components/site/count-up";
import InView from "@/components/site/in-view";
import Reveal from "@/components/site/reveal";

/** Marks the all-caps comment keywords (PRICE, LINK, ...) inside a sentence. */
function WithMarkedKeywords({ text }: { text: string }) {
  return (
    <>
      {text.split(/\b([A-Z]{3,})\b/).map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="marker rounded-sm font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function Tick({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.3a1 1 0 0 1-1.42 0L4.78 10.7a1 1 0 1 1 1.42-1.4l2.54 2.56 6.54-6.6a1 1 0 0 1 1.42.04Z" clipRule="evenodd" />
    </svg>
  );
}

/** A dot that breathes, for things that are live right now. */
function LiveDot({ className = "bg-site-reply" }: { className?: string }) {
  return (
    <span aria-hidden="true" className="relative flex h-2 w-2">
      <span className={`live-ping absolute inset-0 rounded-full ${className}`} />
      <span className={`relative h-2 w-2 rounded-full ${className}`} />
    </span>
  );
}

/** The card's words: title, sentence, and one plain fact. */
function Copy({ title, text, fact }: { title: string; text: string; fact: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-md text-[15px] leading-6 text-site-dim">
        <WithMarkedKeywords text={text} />
      </p>
      <p className="site-mono mt-3 text-[12px] text-site-paper">{fact}</p>
    </div>
  );
}

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as React.CSSProperties;

// Each card plays its small sequence once as it comes into view (`seq` steps,
// timed by --d), on phones too; hover only lifts the card and brightens its
// edge, never changes what it shows.
const card =
  "use-card glass group relative flex flex-col justify-between gap-6 overflow-hidden rounded-[1.75rem] p-6 sm:p-7";

/* Lead magnets: a comment asks and the guide arrives, step by step. */
function LeadMagnets() {
  return (
    <InView as="article" className={`${card} md:col-span-3 md:row-span-2`}>
      <div className="space-y-3">
        <div className="seq flex items-start gap-2.5 text-[13px]" style={delay(0.1)}>
          <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3a2a4a] text-[11px] font-semibold">
            M
          </span>
          <p className="rounded-2xl rounded-tl-md bg-white/[0.06] px-3 py-2">
            <span className="font-semibold">meera.shop</span>{" "}
            <mark className="seq-mark marker rounded-sm font-semibold" style={delay(0.5)}>GUIDE</mark> please
          </p>
        </div>

        <div className="ml-auto w-[min(100%,19rem)] space-y-1.5">
          <p className="seq ml-auto w-fit rounded-2xl rounded-br-md bg-site-reply px-3 py-2 text-[13px] text-site-ink" style={delay(0.9)}>
            Here you go, Meera. The full checklist:
          </p>
          <div className="seq rounded-2xl border border-white/10 bg-[#0b161c] p-3" style={delay(1.3)}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-8 items-end justify-center rounded-md bg-site-paper pb-1 text-[8px] font-bold text-site-ink">
                PDF
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">reel-hooks-checklist.pdf</p>
                <p className="text-[12px] text-site-dim">14 pages</p>
              </div>
              <span className="seq-pop site-mono flex items-center gap-1 text-[11px] text-site-reply" style={delay(1.8)}>
                <Tick /> Sent
              </span>
            </div>
          </div>
        </div>

        {/* Who else asked today. */}
        <div className="seq pt-4" style={delay(2.1)}>
          <p className="site-mono flex items-center gap-1.5 text-[11px] text-site-dim">
            <LiveDot /> Sent today
          </p>
          <ul className="mt-2 divide-y divide-white/[0.06] text-[13px]">
            {[
              ["aditi.writes", "HOOKS", "2m"],
              ["vik.edits", "GUIDE", "9m"],
              ["sara.goa", "GUIDE", "14m"],
            ].map(([handle, keyword, ago], index) => (
              <li
                key={handle}
                className="seq flex items-center gap-2 py-2"
                style={delay(2.2 + index * 0.12)}
              >
                <span className="font-medium">{handle}</span>
                <mark className="marker rounded-sm text-[12px] font-semibold">{keyword}</mark>
                <span className="site-mono ml-auto flex items-center gap-1 text-[11px] text-site-dim">
                  <Tick className="h-3 w-3 text-site-reply" /> {ago}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="site-mono flex flex-wrap gap-2 pt-3 text-[11px]" aria-label="Other things you can send">
          {["Discount code", "Webinar link", "Free sample"].map((item, index) => (
            <li
              key={item}
              className="seq rounded-full border border-white/10 px-3 py-1.5 text-site-dim"
              style={delay(2.6 + index * 0.08)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Copy
        title="Lead magnets"
        text="Send guides, checklists, discount links, webinar links, or gated resources the moment someone asks."
        fact="Delivered seconds after the comment"
      />
    </InView>
  );
}

/* Social commerce: the keyword keeps changing, the answer is always the product. */
function SocialCommerce() {
  const words = ["PRICE", "LINK", "SIZE", "BUY"];
  return (
    <InView as="article" className={`${card} md:col-span-3`}>
      {/* Comment, arrow, product: one row from small tablets up; stacked on
          phones, where the arrow turns to point down. */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pl-1.5 pr-3 text-[13px]">
          <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5c2a12] text-[10px] font-semibold">A</span>
          <span className="sr-only">Comments like PRICE, LINK, SIZE or BUY</span>
          {/* One keyword at a time, rolling through what buyers type. */}
          <span aria-hidden="true" className="ticker h-5 overflow-hidden">
            <span className="ticker-track flex flex-col">
              {[...words, words[0]].map((word, index) => (
                <mark key={`${word}-${index}`} className="marker h-5 rounded-sm text-[12px] font-semibold leading-5">
                  {word}
                </mark>
              ))}
            </span>
          </span>
        </div>
        <svg aria-hidden="true" className="ml-3 h-4 w-4 shrink-0 rotate-90 text-site-dim sm:ml-0 sm:rotate-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" />
        </svg>
        <div className="seq flex w-full min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0b161c] p-2 pr-2.5" style={delay(0.4)}>
          <span aria-hidden="true" className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-[#5c2a12] via-[#8a3d18] to-site-marker" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold">Saffron Glow Serum</p>
            <p className="text-[12px] text-site-dim">₹849</p>
          </div>
          <span className="rounded-full bg-site-reply px-2.5 py-1 text-[11px] font-semibold text-site-ink">
            Buy now
          </span>
        </div>
      </div>

      <Copy
        title="Social commerce"
        text="Turn comments like PRICE, LINK, SIZE, or BUY into an instant product conversation inside Instagram."
        fact="One product card for every way people ask"
      />
    </InView>
  );
}

/* Agency workflows: every client in one place, arriving one by one. */
function AgencyWorkflows() {
  const clients = [
    ["kesari.skin", "4 campaigns", true],
    ["tanvi.wanders", "2 campaigns", true],
    ["kabir.grows", "3 campaigns", false],
  ] as const;
  return (
    <InView as="article" className={`${card} md:col-span-3`}>
      <ul className="space-y-1.5">
        {clients.map(([handle, campaigns, live], index) => (
          <li
            key={handle}
            className="seq flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[13px]"
            style={delay(0.15 + index * 0.15)}
          >
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold uppercase">
              {handle[0]}
            </span>
            <span className="font-medium">{handle}</span>
            <span className="text-site-dim">{campaigns}</span>
            <span className="site-mono ml-auto flex items-center gap-1.5 text-[11px]">
              {live ? <LiveDot /> : <span aria-hidden="true" className="h-2 w-2 rounded-full bg-white/25" />}
              {live ? "Live" : "Paused"}
            </span>
          </li>
        ))}
      </ul>

      <Copy
        title="Agency workflows"
        text="Package repeatable comment-to-DM funnels for campaign clients without relying on manual inbox work."
        fact="One workspace per client, roles for your team"
      />
    </InView>
  );
}

/* Creator launches: comments per hour after a reel goes live; the bars grow in. */
function CreatorLaunches() {
  const volume = [6, 8, 7, 10, 14, 30, 72, 100, 86, 64, 48, 40, 33, 28, 24, 20, 18, 15, 13, 12, 10, 9, 8, 7];
  const peak = volume.indexOf(Math.max(...volume));
  return (
    <InView as="article" className={`${card} md:col-span-6 md:flex-row md:items-end md:gap-10`}>
      <div className="md:w-[40%] md:shrink-0">
        <Copy
          title="Creator launches"
          text="Capture spikes from reels, stories, and launches while the audience is actively engaging."
          fact={
            <>
              <CountUp value={1240} /> comments answered in the first hour
            </>
          }
        />
      </div>

      <figure className="min-w-0 flex-1">
        <div className="site-mono mb-3 flex items-center justify-between text-[11px] text-site-dim">
          <span className="flex items-center gap-1.5 text-site-paper">
            <LiveDot className="bg-site-marker" /> Reel live
          </span>
          <span>Comments per hour, first 24 hours</span>
        </div>
        <div className="flex h-32 items-end gap-[3px]" role="img" aria-label="Comments spike in the second hour after the reel goes live, then taper off over the day">
          {volume.map((value, index) => (
            <span
              key={index}
              className={`grow-bar flex-1 origin-bottom rounded-t-[3px] ${
                index === peak ? "bg-site-marker" : "bg-site-reply/75"
              }`}
              style={{ height: `${value}%`, ...delay(0.2 + index * 0.03) }}
            />
          ))}
        </div>
      </figure>
    </InView>
  );
}

/** The use cases as a bento of cards, each with a small working piece of the product. */
export default function UseCases() {
  return (
    <Reveal stagger className="mt-12 grid gap-4 md:auto-rows-[minmax(15rem,auto)] md:grid-cols-6">
      <LeadMagnets />
      <SocialCommerce />
      <AgencyWorkflows />
      <CreatorLaunches />
    </Reveal>
  );
}
