import { Clip } from "@/components/site/media";

// Each tile plays a short reel for its audience: public/video/aud-<clip>.mp4
// with a poster at public/images/aud-<clip>.webp. The clips are free stock
// footage from Pexels (Pexels License: commercial use, no attribution).
const creators = [
  { label: "DTC store", clip: "dtc", alt: "Packing an order for shipping" },
  { label: "Creator studio", clip: "creator", alt: "A phone on a tripod filming a creator" },
  { label: "Agency desk", clip: "agency", alt: "A team working together at one desk" },
  { label: "Course seller", clip: "course", alt: "A student in an online class" },
  { label: "Launch team", clip: "launch", alt: "Opening a delivered package" },
  { label: "Beauty brand", clip: "beauty", alt: "A serum bottle set down on display" },
  { label: "Fitness coach", clip: "fitness", alt: "A coach mid-workout" },
  { label: "Event team", clip: "event", alt: "A crowd at an outdoor concert" },
];

/** Scene five: an endless strip of reels from the people ReplyNxt is for. */
export default function CreatorsMarquee() {
  return (
    <section aria-labelledby="audiences-heading" className="marquee overflow-hidden py-16">
      <p id="audiences-heading" className="site-mono mx-auto max-w-6xl px-4 text-[13px] text-site-dim sm:px-6">
        Designed for teams turning social attention into owned conversations
      </p>
      <div className="relative mt-8 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-track flex w-max gap-5">
          {[...creators, ...creators].map((creator, index) => (
            <li
              key={`${creator.label}-${index}`}
              aria-hidden={index >= creators.length}
              className="relative aspect-[9/16] w-60 shrink-0 overflow-hidden rounded-[1.75rem] border border-white/10 sm:w-72"
            >
              <Clip
                name={`aud-${creator.clip}`}
                poster={`aud-${creator.clip}`}
                label={creator.alt}
                className="h-full w-full"
              />
              {/* The reel mark, so the tile reads as a reel. */}
              <svg aria-hidden="true" className="absolute right-3 top-3 h-5 w-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
                <path d="M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Zm-3.5 5h17M9 3.5l3 5m2-5 3 5M10.5 12v5l4-2.5-4-2.5Z" />
              </svg>
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-site-ink via-transparent to-transparent" />
              <span className="absolute inset-x-4 bottom-4 text-lg font-semibold">{creator.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
