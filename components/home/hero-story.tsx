"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HeroFlow, { type FeedMedia } from "@/components/home/hero-flow";
import { gsap, ScrollTrigger, useGSAP } from "@/components/site/gsap";

const steps = [
  {
    title: "Someone scrolls past your post",
    body: "Your reel or post is live with a keyword campaign attached.",
  },
  {
    title: "They comment the keyword and get an instant reply",
    body: "ReplyNxt spots the keyword and answers under the comment within seconds.",
  },
  {
    title: "The private reply lands in their DMs",
    body: "An official Meta private reply, one per matched comment, logged as it sends.",
  },
  {
    title: "They tap through and get what they asked for",
    body: "A product page, a follow-gated download, or a guide, with every click tracked.",
  },
];

// Wide screens get the travelling phone; the layout switches at Tailwind's lg.
const WIDE = "(min-width: 1024px)";

/** Which phone step a point in the story's scroll shows. */
function phaseAt(progress: number) {
  return Math.min(4, Math.floor(progress * 4) + 1);
}

function Step({ index, current, className }: { index: number; current: boolean; className: string }) {
  const step = steps[index];
  return (
    <li
      aria-current={current ? "step" : undefined}
      className={`transition-opacity duration-500 ${current ? "lg:opacity-100" : "lg:opacity-35"} ${className}`}
    >
      <span className="site-mono text-[13px] text-site-marker">0{index + 1}</span>
      <h3 className="mt-1.5 text-xl leading-tight xl:text-2xl">{step.title}</h3>
      <p className="mt-1.5 text-[15px] leading-6 text-site-dim">{step.body}</p>
    </li>
  );
}

/**
 * The hero and the story after it share one phone. On wide screens it starts
 * under the hero's message, a third wider than it is in the story, rising
 * out of the bottom of the screen; as the hero scrolls away it shrinks into the middle of the
 * story, then holds there while the heading and four steps stay still behind
 * it and the scroll steps the phone through the flow. Back in the hero it runs
 * on its own timer again. On phones it sits under the hero text, plays by
 * itself, and the steps follow as a plain list.
 */
export default function HeroStory({
  intro,
  stats,
  feeds,
}: {
  intro: React.ReactNode;
  stats: React.ReactNode;
  feeds: FeedMedia[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const [scrollPhase, setScrollPhase] = useState<number | null>(null);
  // Where the phone starts on desktop: just under the hero's message.
  const [phoneTop, setPhoneTop] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const box = introRef.current?.getBoundingClientRect();
      if (box) setPhoneTop(Math.round(box.bottom + window.scrollY + 36));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // The phone's move is measured from where it starts, so re-measure it.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [phoneTop]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(WIDE, () => {
        const q = gsap.utils.selector(root);
        const [phone] = q("[data-flow-phone]");
        const chrome = q("[data-flow-chrome]");
        if (!phone || !storyRef.current) return;

        // From beside the hero text to the middle of the screen, as large as
        // the screen allows, while the tabs and caption fade out.
        // The phone's untransformed box, worked out from layout so the
        // transforms below never feed back into the measurement. The top is
        // taken from the sticky stage, which sits at the top of the screen
        // while the phone moves, so it is the same at any scroll position.
        const stage = phone.closest("[data-phone-stage]")!;
        const natural = () => {
          const parent = phone.parentElement!;
          const outer = parent.getBoundingClientRect();
          const left = outer.left + phone.offsetLeft - parent.offsetLeft;
          const top =
            outer.top - stage.getBoundingClientRect().top + phone.offsetTop - parent.offsetTop;
          return { left, top, width: phone.offsetWidth, height: phone.offsetHeight };
        };
        // In the story: centred and as tall as the room under the header.
        const story = () => {
          const box = natural();
          const room = window.innerHeight - 96;
          const scale = room / box.height;
          return {
            x: window.innerWidth / 2 - (box.left + box.width / 2),
            y: 80 - box.top,
            scale,
          };
        };
        // In the hero: a third wider than it is in the story, grown from its
        // top edge so it rises out of the bottom of the screen, and never
        // wider than a third of the page.
        const hero = () => {
          const box = natural();
          const byStory = story().scale * 1.3;
          const byWidth = (window.innerWidth / 3) / box.width;
          return { x: 0, y: 0, scale: Math.max(1, Math.min(byStory, byWidth)) };
        };
        gsap.set(phone, { transformOrigin: "50% 0%" });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: storyRef.current,
              start: "top bottom",
              end: "top top",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            phone,
            { x: () => hero().x, y: () => hero().y, scale: () => hero().scale },
            { x: () => story().x, y: () => story().y, scale: () => story().scale, ease: "power2.inOut" },
            0
          )
          .to(chrome, { autoAlpha: 0, duration: 0.3 }, 0);

        // While the story holds, its scroll sets the phone's step.
        ScrollTrigger.create({
          trigger: storyRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => setScrollPhase(phaseAt(self.progress)),
          onEnter: () => setScrollPhase(1),
          onLeaveBack: () => setScrollPhase(null),
        });

        return () => setScrollPhase(null);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:min-h-[100dvh]">
        <div ref={introRef} className="pt-[6.5rem] text-center lg:pt-28">
          {intro}
        </div>
        <div className="mt-12 lg:mt-auto lg:pb-8">{stats}</div>
      </div>

      {/* The phone. On phones it follows the hero text; on desktop it rides
          above both sections and stays on screen until the story ends. */}
      <div className="relative z-10 mt-12 flex justify-center lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:block">
        <div data-phone-stage className="lg:sticky lg:top-0 lg:h-[100dvh]">
          <div
            className="flex justify-center lg:pt-[var(--phone-top)]"
            style={{ "--phone-top": `${phoneTop}px` } as React.CSSProperties}
          >
            <div className="lg:pointer-events-auto">
              <HeroFlow feeds={feeds} scrollPhase={scrollPhase} />
            </div>
          </div>
        </div>
      </div>

      {/* The story. On desktop it holds still as a backdrop behind the phone
          while the page scrolls through its four steps. */}
      <div ref={storyRef} className="relative lg:h-[400dvh]">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col lg:pb-6 lg:pt-24">
          <div className="lg:text-center">
            <p className="site-mono text-[13px] text-site-dim">From comment to DM</p>
            <h2 className="mt-3 max-w-lg text-4xl leading-[1.05] sm:text-5xl lg:mx-auto lg:max-w-none lg:text-[clamp(2.75rem,min(6.5vw,10vh),6.5rem)] lg:leading-[0.95] lg:text-site-paper/40">
              One comment. One keyword. One <em>reply</em>.
            </h2>
          </div>
          {/* Two steps either side of the phone, which takes the middle. */}
          <ol className="mt-10 grid gap-8 lg:mt-4 lg:flex-1 lg:grid-cols-[1fr_calc((100dvh-6rem)*9/17.4+4rem)_1fr] lg:content-center lg:gap-x-0 lg:gap-y-[6dvh]">
            <Step index={0} current={scrollPhase === 1} className="lg:col-start-1 lg:row-start-1 lg:pr-4" />
            <Step index={1} current={scrollPhase === 2} className="lg:col-start-1 lg:row-start-2 lg:pr-4" />
            <Step index={2} current={scrollPhase === 3} className="lg:col-start-3 lg:row-start-1 lg:pl-4" />
            <Step index={3} current={scrollPhase === 4} className="lg:col-start-3 lg:row-start-2 lg:pl-4" />
          </ol>
        </div>
      </div>
    </div>
  );
}
