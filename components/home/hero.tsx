import CtaButton from "@/components/site/cta-button";
import Reveal from "@/components/site/reveal";
import SplitHeadline from "@/components/site/split-headline";
import { Clip } from "@/components/site/media";
import { feedMedia } from "@/components/home/feed-media";
import HeroStory from "@/components/home/hero-story";
import { flowScenes } from "@/components/home/hero-flow-scenes";

// Two stats stacked either side of the phone, which takes the middle half.
const statPlace = [
  "lg:col-start-1 lg:row-start-1",
  "lg:col-start-1 lg:row-start-2",
  "lg:col-start-3 lg:row-start-1 lg:items-end lg:text-right",
  "lg:col-start-3 lg:row-start-2 lg:items-end lg:text-right",
];

const heroStats = [
  { value: "24/7", label: "comment monitoring" },
  { value: "1", label: "DM per matched comment" },
  { value: "0", label: "scraping required" },
  { value: "100", label: "free DMs every month" },
];

/** Label first in the markup, as a definition list needs; shown under the number. */
function Stat({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div className={`flex flex-col-reverse gap-1 ${className}`}>
      <dt className="site-mono text-[13px] text-site-paper">{label}</dt>
      <dd className="display text-3xl">{value}</dd>
    </div>
  );
}

/**
 * Opening scene: the creator's clip behind the beam, headline rising in, and
 * the phone that carries on into the comment-to-DM steps.
 */
export default function Hero() {
  return (
    <section className="relative isolate">
      {/* The clip dissolves into the page instead of ending on an edge. */}
      <div className="absolute inset-x-0 top-0 -z-20 h-[100dvh] overflow-hidden">
        <Clip
          name="hero"
          poster="hero-poster"
          controls
          label="A creator filming a reel while comments float past"
          className="h-full w-full opacity-40 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
        />
      </div>
      {/* The beam is the page's opening light: it runs past the hero and
          fades out, so no section has a background of its own. */}
      <div
        aria-hidden="true"
        className="beam-hero pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[150dvh]"
      />

      {/* Message and action centred at the top, the phone rising from the
          bottom between the stats. It then carries on into the story below. */}
      <HeroStory
        feeds={flowScenes.map((scene) => feedMedia(scene.id))}
        intro={
          <>
            <Reveal onLoadDelay={0}>
              <p className="site-mono text-[13px] text-site-paper">Built for Meta-compliant Instagram growth</p>
            </Reveal>
            {/* Scales with the screen's height too, so the phone has room below
                it: one line on desktop, two lines capped in ems elsewhere. */}
            <SplitHeadline
              as="h1"
              onLoad
              className="mx-auto mt-5 max-w-[13em] text-[clamp(2.75rem,min(5.6vw,9vh),5.5rem)] leading-[0.95] lg:max-w-none lg:text-[clamp(2.75rem,min(4.4vw,8.5vh),4.75rem)]"
            >
              Make every comment start the right <em>DM</em>.
            </SplitHeadline>
            <Reveal onLoadDelay={0.45}>
              <div className="mt-7 flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-10">
                <p className="max-w-md text-base leading-7 text-site-paper/90 lg:max-w-[40rem] lg:text-left">
                  ReplyNxt turns keyword comments on posts and reels into private
                  replies, campaign logs, and measurable lead capture for
                  businesses, creators, and agencies.
                </p>
                <CtaButton href="/login" size="lg" className="shrink-0">
                  Start free
                </CtaButton>
              </div>
            </Reveal>
          </>
        }
        stats={
          <Reveal onLoadDelay={0.75}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 lg:grid-cols-[1fr_52vw_1fr] lg:border-t-0 lg:pt-0">
              {heroStats.map((stat, index) => (
                <Stat
                  key={stat.label}
                  {...stat}
                  className={statPlace[index]}
                />
              ))}
            </dl>
          </Reveal>
        }
      />
    </section>
  );
}
